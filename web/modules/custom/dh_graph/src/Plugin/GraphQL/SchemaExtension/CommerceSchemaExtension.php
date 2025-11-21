<?php

namespace Drupal\dh_graph\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\Annotation\SchemaExtension;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * @SchemaExtension(
 *   id = "commerce_extension",
 *   name = "Commerce Extension",
 *   description = "Adds Commerce entities to GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class CommerceSchemaExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry) {
    $builder = new ResolverBuilder();

    // Helper functions for cart management
    $getCartFromSession = function() {
      $tempstore = \Drupal::service('tempstore.private')->get('dh_graph');
      $cart = $tempstore->get('cart');
      return $cart ?: [];
    };

    $saveCartToSession = function($cart) {
      $tempstore = \Drupal::service('tempstore.private')->get('dh_graph');
      $tempstore->set('cart', $cart);
    };

    $getProductDetails = function($productId) {
      $entityTypeManager = \Drupal::entityTypeManager();
      $storage = $entityTypeManager->getStorage('commerce_product');
      $products = $storage->loadByProperties(['uuid' => $productId]);

      if (empty($products)) {
        return null;
      }

      $product = reset($products);
      $variations = $product->getVariations();

      if (empty($variations)) {
        return null;
      }

      $variation = reset($variations);
      $price = $variation->getPrice();

      // Get product image
      $image = '';
      if ($product->hasField('field_images') && !$product->get('field_images')->isEmpty()) {
        $imageField = $product->get('field_images')->first();
        if ($imageField && $imageField->entity) {
          $fileUri = $imageField->entity->getFileUri();
          $image = \Drupal::service('file_url_generator')->generateAbsoluteString($fileUri);
        }
      }

      return [
        'id' => $product->uuid(),
        'title' => $product->label(),
        'sku' => $variation->getSku(),
        'price' => $price ? (float) $price->getNumber() : 0.0,
        'image' => $image,
      ];
    };

    // Query for products.
    $registry->addFieldResolver('Query', 'commerceProducts',
      $builder->callback(function ($value, $args, $context, $info) {
        $entityTypeManager = \Drupal::entityTypeManager();
        $storage = $entityTypeManager->getStorage('commerce_product');
        $query = $storage->getQuery();
        $query->accessCheck(TRUE);

        if (isset($args['offset'])) {
          $query->range($args['offset']);
        }
        if (isset($args['limit'])) {
          $query->range($args['offset'] ?? 0, $args['limit']);
        }

        $ids = $query->execute();
        return $storage->loadMultiple($ids);
      })
    );

    // Query for single product by ID.
    $registry->addFieldResolver('Query', 'commerceProduct',
      $builder->callback(function ($value, $args, $context, $info) {
        $entityTypeManager = \Drupal::entityTypeManager();
        $storage = $entityTypeManager->getStorage('commerce_product');
        $product = $storage->load($args['id']);
        return $product;
      })
    );

    // Query for stores.
    $registry->addFieldResolver('Query', 'commerceStores',
      $builder->callback(function ($value, $args, $context, $info) {
        $entityTypeManager = \Drupal::entityTypeManager();
        $storage = $entityTypeManager->getStorage('commerce_store');
        $query = $storage->getQuery();
        $query->accessCheck(TRUE);

        if (isset($args['offset'])) {
          $query->range($args['offset']);
        }
        if (isset($args['limit'])) {
          $query->range($args['offset'] ?? 0, $args['limit']);
        }

        $ids = $query->execute();
        return $storage->loadMultiple($ids);
      })
    );

    // Product fields.
    $registry->addFieldResolver('CommerceProduct', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('CommerceProduct', 'uuid',
      $builder->produce('entity_uuid')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('CommerceProduct', 'title',
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('CommerceProduct', 'sku',
      $builder->callback(function ($value, $args, $context, $info) {
        $product = $value;
        if (!$product) {
          return null;
        }
        $variations = $product->getVariations();
        if (empty($variations)) {
          return null;
        }
        $variation = reset($variations);
        return $variation->getSku();
      })
    );

    $registry->addFieldResolver('CommerceProduct', 'price',
      $builder->callback(function ($value, $args, $context, $info) {
        $product = $value;
        if (!$product) {
          return null;
        }
        $variations = $product->getVariations();
        if (empty($variations)) {
          return null;
        }
        $variation = reset($variations);
        $price = $variation->getPrice();
        return $price ? (float) $price->getNumber() : 0.0;
      })
    );

    $registry->addFieldResolver('CommerceProduct', 'body',
      $builder->callback(function ($value, $args, $context, $info) {
        $product = $value;
        if ($product && $product->hasField('body') && !$product->get('body')->isEmpty()) {
          return $product->get('body')->value;
        }
        return null;
      })
    );

    $registry->addFieldResolver('CommerceProduct', 'path',
      $builder->callback(function ($value, $args, $context, $info) {
        $product = $value;
        if (!$product) {
          return null;
        }
        // Try to get path from path alias
        $path = '/product/' . $product->id();
        try {
          $alias = \Drupal::service('path_alias.manager')->getAliasByPath('/product/' . $product->id());
          if ($alias) {
            $path = $alias;
          }
        } catch (\Exception $e) {
          // Use default path if alias lookup fails
        }
        return $path;
      })
    );

    $registry->addFieldResolver('CommerceProduct', 'images',
      $builder->callback(function ($value, $args, $context, $info) {
        $product = $value;
        $images = [];
        if ($product && $product->hasField('field_images') && !$product->get('field_images')->isEmpty()) {
          foreach ($product->get('field_images') as $imageField) {
            if ($imageField->entity) {
              $fileUri = $imageField->entity->getFileUri();
              $images[] = \Drupal::service('file_url_generator')->generateAbsoluteString($fileUri);
            }
          }
        }
        return $images;
      })
    );

    $registry->addFieldResolver('CommerceProduct', 'category',
      $builder->callback(function ($value, $args, $context, $info) {
        $product = $value;

        if ($product && $product->hasField('field_category') && !$product->get('field_category')->isEmpty()) {
          // Get the field value (machine name)
          $category_value = $product->get('field_category')->value;

          // Get the field definition to access allowed values
          $field_definition = $product->getFieldDefinition('field_category');
          $allowed_values = $field_definition->getSetting('allowed_values');

          // Return the label if available, otherwise return the value
          $category_label = isset($allowed_values[$category_value]) ? $allowed_values[$category_value] : $category_value;

          \Drupal::logger('dh_graph')->info('Category for @product: value=@value, label=@label', [
            '@product' => $product->label(),
            '@value' => $category_value,
            '@label' => $category_label,
          ]);

          return $category_label;
        }

        return null;
      })
    );

    // Store fields.
    $registry->addFieldResolver('CommerceStore', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('CommerceStore', 'name',
      $builder->callback(function ($value, $args, $context, $info) {
        $entity = $value;
        if ($entity && $entity->hasField('name')) {
          return $entity->get('name')->value;
        }
        return null;
      })
    );

    // Cart query.
    $registry->addFieldResolver('Query', 'cart',
      $builder->callback(function ($value, $args, $context, $info) use ($getCartFromSession, $getProductDetails) {
        $cart = $getCartFromSession();

        $timestamp = time();
        \Drupal::logger('dh_graph')->info('Cart query at @time - Retrieved from session: @cart', [
          '@time' => $timestamp,
          '@cart' => print_r($cart, TRUE),
        ]);

        $items = [];
        $totalItems = 0;
        $totalPrice = 0.0;

        foreach ($cart as $cartItem) {
          \Drupal::logger('dh_graph')->info('Processing cart item: @item', [
            '@item' => print_r($cartItem, TRUE),
          ]);

          $productDetails = $getProductDetails($cartItem['productId']);

          \Drupal::logger('dh_graph')->info('Product details: @details', [
            '@details' => print_r($productDetails, TRUE),
          ]);

          if ($productDetails) {
            $itemTotal = $productDetails['price'] * $cartItem['quantity'];
            $items[] = [
              'id' => $cartItem['id'],
              'productId' => $cartItem['productId'],
              'quantity' => $cartItem['quantity'],
              'addedAt' => $cartItem['addedAt'],
              'product' => $productDetails,
            ];
            $totalItems += $cartItem['quantity'];
            $totalPrice += $itemTotal;
          } else {
            \Drupal::logger('dh_graph')->warning('Product not found for ID: @id', [
              '@id' => $cartItem['productId'],
            ]);
          }
        }

        \Drupal::logger('dh_graph')->info('Cart query - Final result: @items items, total: @total', [
          '@items' => $totalItems,
          '@total' => $totalPrice,
        ]);

        // Add cache metadata to disable caching for cart data
        $result = [
          'items' => $items,
          'totalItems' => $totalItems,
          'totalPrice' => $totalPrice,
        ];

        // Add cache context to vary by session
        if (method_exists($context, 'addCacheableDependency')) {
          $cache_metadata = new \Drupal\Core\Cache\CacheableMetadata();
          $cache_metadata->setCacheMaxAge(0);
          $cache_metadata->addCacheContexts(['session']);
          $context->addCacheableDependency($cache_metadata);
        }

        return $result;
      })
    );

    // Add to cart mutation.
    $registry->addFieldResolver('Mutation', 'addToCart',
      $builder->callback(function ($value, $args, $context, $info) use ($getCartFromSession, $saveCartToSession) {
        $productId = $args['productId'];
        $quantity = $args['quantity'] ?? 1;

        \Drupal::logger('dh_graph')->info('Adding to cart: @productId with quantity @quantity', [
          '@productId' => $productId,
          '@quantity' => $quantity,
        ]);

        $cart = $getCartFromSession();
        \Drupal::logger('dh_graph')->info('Current cart contents: @cart', [
          '@cart' => print_r($cart, TRUE),
        ]);

        // Check if product already exists in cart
        $existingItemKey = null;
        foreach ($cart as $key => $item) {
          if ($item['productId'] === $productId) {
            $existingItemKey = $key;
            break;
          }
        }

        if ($existingItemKey !== null) {
          // Update quantity if product already in cart
          $cart[$existingItemKey]['quantity'] += $quantity;
          $cartItem = $cart[$existingItemKey];
        } else {
          // Add new item to cart
          $cartItem = [
            'id' => uniqid('cart_item_'),
            'productId' => $productId,
            'quantity' => $quantity,
            'addedAt' => date('c'),
          ];
          $cart[] = $cartItem;
        }

        $saveCartToSession($cart);

        \Drupal::logger('dh_graph')->info('Cart after adding: @cart', [
          '@cart' => print_r($cart, TRUE),
        ]);

        return $cartItem;
      })
    );

    // Update cart item mutation.
    $registry->addFieldResolver('Mutation', 'updateCartItem',
      $builder->callback(function ($value, $args, $context, $info) use ($getCartFromSession, $saveCartToSession) {
        $itemId = $args['itemId'];
        $quantity = $args['quantity'];

        $cart = $getCartFromSession();

        foreach ($cart as $key => $item) {
          if ($item['id'] === $itemId) {
            $cart[$key]['quantity'] = $quantity;
            $saveCartToSession($cart);
            return $cart[$key];
          }
        }

        throw new \Exception("Cart item not found");
      })
    );

    // Remove from cart mutation.
    $registry->addFieldResolver('Mutation', 'removeFromCart',
      $builder->callback(function ($value, $args, $context, $info) use ($getCartFromSession, $saveCartToSession) {
        $itemId = $args['itemId'];

        $cart = $getCartFromSession();

        foreach ($cart as $key => $item) {
          if ($item['id'] === $itemId) {
            unset($cart[$key]);
            $saveCartToSession(array_values($cart));
            return true;
          }
        }

        return false;
      })
    );

    // Clear cart mutation.
    $registry->addFieldResolver('Mutation', 'clearCart',
      $builder->callback(function ($value, $args, $context, $info) use ($saveCartToSession) {
        $saveCartToSession([]);
        return true;
      })
    );

    // Cart item fields.
    $registry->addFieldResolver('CartItem', 'id',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['id'];
      })
    );

    $registry->addFieldResolver('CartItem', 'productId',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['productId'];
      })
    );

    $registry->addFieldResolver('CartItem', 'quantity',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['quantity'];
      })
    );

    $registry->addFieldResolver('CartItem', 'addedAt',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['addedAt'];
      })
    );

    $registry->addFieldResolver('CartItem', 'product',
      $builder->callback(function ($value, $args, $context, $info) use ($getProductDetails) {
        $productId = $value['productId'];
        return $getProductDetails($productId);
      })
    );

    // CartData resolvers.
    $registry->addFieldResolver('CartData', 'items',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['items'];
      })
    );

    $registry->addFieldResolver('CartData', 'totalItems',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['totalItems'];
      })
    );

    $registry->addFieldResolver('CartData', 'totalPrice',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['totalPrice'];
      })
    );

    // ProductWithDetails resolvers.
    $registry->addFieldResolver('ProductWithDetails', 'id',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['id'];
      })
    );

    $registry->addFieldResolver('ProductWithDetails', 'title',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['title'];
      })
    );

    $registry->addFieldResolver('ProductWithDetails', 'sku',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['sku'];
      })
    );

    $registry->addFieldResolver('ProductWithDetails', 'price',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['price'];
      })
    );

    $registry->addFieldResolver('ProductWithDetails', 'image',
      $builder->callback(function ($value, $args, $context, $info) {
        return $value['image'];
      })
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getExtensionSchema() {
    return '';
  }
}
