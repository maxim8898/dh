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

    // Helper function to get or create cart for current user
    $getCart = function() {
      $cart_provider = \Drupal::service('commerce_cart.cart_provider');
      $cart_manager = \Drupal::service('commerce_cart.cart_manager');
      $store_storage = \Drupal::entityTypeManager()->getStorage('commerce_store');

      // Get the default store
      $stores = $store_storage->loadMultiple();
      $store = reset($stores);

      if (!$store) {
        throw new \Exception('No store available');
      }

      // Get current user's cart or create new one
      $cart = $cart_provider->getCart('default', $store);
      if (!$cart) {
        $cart = $cart_provider->createCart('default', $store);
      }

      return $cart;
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
      $builder->callback(function ($value, $args, $context, $info) use ($getCart, $getProductDetails) {
        try {
          $cart = $getCart();

          \Drupal::logger('dh_graph')->info('Cart query - Loading Commerce cart: @id', [
            '@id' => $cart->id(),
          ]);

          $items = [];
          $totalItems = 0;
          $totalPrice = 0.0;

          // Get order items from the cart
          foreach ($cart->getItems() as $order_item) {
            $purchased_entity = $order_item->getPurchasedEntity();

            if (!$purchased_entity) {
              continue;
            }

            // Get the product from the variation
            $product = $purchased_entity->getProduct();

            if (!$product) {
              continue;
            }

            $unit_price = $order_item->getUnitPrice();
            $quantity = (int) $order_item->getQuantity();
            $total_price = $order_item->getTotalPrice();

            // Get product image
            $image = '';
            if ($product->hasField('field_images') && !$product->get('field_images')->isEmpty()) {
              $imageField = $product->get('field_images')->first();
              if ($imageField && $imageField->entity) {
                $fileUri = $imageField->entity->getFileUri();
                $image = \Drupal::service('file_url_generator')->generateAbsoluteString($fileUri);
              }
            }

            $items[] = [
              'id' => (string) $order_item->id(),
              'productId' => $product->uuid(),
              'quantity' => $quantity,
              'addedAt' => date('c', $order_item->getCreatedTime()),
              'product' => [
                'id' => $product->uuid(),
                'title' => $product->label(),
                'sku' => $purchased_entity->getSku(),
                'price' => $unit_price ? (float) $unit_price->getNumber() : 0.0,
                'image' => $image,
              ],
            ];

            $totalItems += $quantity;
            $totalPrice += $total_price ? (float) $total_price->getNumber() : 0.0;
          }

          \Drupal::logger('dh_graph')->info('Cart query - Final result: @items items, total: @total', [
            '@items' => $totalItems,
            '@total' => $totalPrice,
          ]);

          $result = [
            'items' => $items,
            'totalItems' => $totalItems,
            'totalPrice' => $totalPrice,
          ];

          // Add cache context to vary by session
          if (method_exists($context, 'addCacheableDependency')) {
            $cache_metadata = new \Drupal\Core\Cache\CacheableMetadata();
            $cache_metadata->setCacheMaxAge(0);
            $cache_metadata->addCacheContexts(['session', 'user']);
            $context->addCacheableDependency($cache_metadata);
          }

          return $result;
        } catch (\Exception $e) {
          \Drupal::logger('dh_graph')->error('Cart query error: @error', [
            '@error' => $e->getMessage(),
          ]);

          return [
            'items' => [],
            'totalItems' => 0,
            'totalPrice' => 0.0,
          ];
        }
      })
    );

    // Add to cart mutation.
    $registry->addFieldResolver('Mutation', 'addToCart',
      $builder->callback(function ($value, $args, $context, $info) use ($getCart) {
        $productId = $args['productId'];
        $quantity = $args['quantity'] ?? 1;

        \Drupal::logger('dh_graph')->info('Adding to cart: @productId with quantity @quantity', [
          '@productId' => $productId,
          '@quantity' => $quantity,
        ]);

        try {
          $cart_manager = \Drupal::service('commerce_cart.cart_manager');
          $entity_type_manager = \Drupal::entityTypeManager();

          // Load product by UUID
          $product_storage = $entity_type_manager->getStorage('commerce_product');
          $products = $product_storage->loadByProperties(['uuid' => $productId]);

          if (empty($products)) {
            throw new \Exception('Product not found');
          }

          $product = reset($products);
          $variations = $product->getVariations();

          if (empty($variations)) {
            throw new \Exception('Product has no variations');
          }

          // Get the first variation (or you could add variation selection logic)
          $variation = reset($variations);

          // Get or create cart
          $cart = $getCart();

          // Add item to cart (will combine with existing if already present)
          $order_items = $cart_manager->addEntity($cart, $variation, $quantity);

          \Drupal::logger('dh_graph')->info('addEntity returned: @result', [
            '@result' => print_r($order_items, TRUE),
          ]);

          // addEntity returns array of order item entities
          $order_item = reset($order_items);

          \Drupal::logger('dh_graph')->info('Order item after reset: @type - @value', [
            '@type' => gettype($order_item),
            '@value' => is_object($order_item) ? get_class($order_item) : (string) $order_item,
          ]);

          // addEntity actually returns order item entities directly, not IDs
          if (!is_object($order_item)) {
            // If we somehow got an ID, try to load it
            $order_item_storage = \Drupal::entityTypeManager()->getStorage('commerce_order_item');
            $order_item = $order_item_storage->load($order_item);
          }

          if (!$order_item || !is_object($order_item)) {
            \Drupal::logger('dh_graph')->error('Order item is not an object: @item', [
              '@item' => print_r($order_item, TRUE),
            ]);
            throw new \Exception('Failed to create order item');
          }

          \Drupal::logger('dh_graph')->info('Added to Commerce cart: Order item @id', [
            '@id' => $order_item->id(),
          ]);

          return [
            'id' => (string) $order_item->id(),
            'productId' => $productId,
            'quantity' => (int) $order_item->getQuantity(),
            'addedAt' => date('c', $order_item->getCreatedTime()),
          ];
        } catch (\Exception $e) {
          \Drupal::logger('dh_graph')->error('Add to cart error: @error', [
            '@error' => $e->getMessage(),
          ]);
          throw $e;
        }
      })
    );

    // Update cart item mutation.
    $registry->addFieldResolver('Mutation', 'updateCartItem',
      $builder->callback(function ($value, $args, $context, $info) use ($getCart) {
        $itemId = $args['itemId'];
        $quantity = $args['quantity'];

        try {
          $cart_manager = \Drupal::service('commerce_cart.cart_manager');
          $order_item_storage = \Drupal::entityTypeManager()->getStorage('commerce_order_item');

          // Load the order item
          $order_item = $order_item_storage->load($itemId);

          if (!$order_item) {
            throw new \Exception('Cart item not found');
          }

          // Update quantity
          $cart_manager->updateOrderItem($order_item, ['quantity' => $quantity]);

          return [
            'id' => (string) $order_item->id(),
            'quantity' => (int) $order_item->getQuantity(),
          ];
        } catch (\Exception $e) {
          \Drupal::logger('dh_graph')->error('Update cart item error: @error', [
            '@error' => $e->getMessage(),
          ]);
          throw $e;
        }
      })
    );

    // Remove from cart mutation.
    $registry->addFieldResolver('Mutation', 'removeFromCart',
      $builder->callback(function ($value, $args, $context, $info) use ($getCart) {
        $itemId = $args['itemId'];

        try {
          $cart_manager = \Drupal::service('commerce_cart.cart_manager');
          $order_item_storage = \Drupal::entityTypeManager()->getStorage('commerce_order_item');

          // Load the order item
          $order_item = $order_item_storage->load($itemId);

          if (!$order_item) {
            throw new \Exception('Cart item not found');
          }

          $cart = $getCart();
          $cart_manager->removeOrderItem($cart, $order_item);

          return true;
        } catch (\Exception $e) {
          \Drupal::logger('dh_graph')->error('Remove from cart error: @error', [
            '@error' => $e->getMessage(),
          ]);
          return false;
        }
      })
    );

    // Clear cart mutation.
    $registry->addFieldResolver('Mutation', 'clearCart',
      $builder->callback(function ($value, $args, $context, $info) use ($getCart) {
        try {
          $cart_manager = \Drupal::service('commerce_cart.cart_manager');
          $cart = $getCart();

          // Empty the cart
          $cart_manager->emptyCart($cart);

          return true;
        } catch (\Exception $e) {
          \Drupal::logger('dh_graph')->error('Clear cart error: @error', [
            '@error' => $e->getMessage(),
          ]);
          return false;
        }
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
