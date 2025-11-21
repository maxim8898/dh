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

    $registry->addFieldResolver('CommerceProduct', 'title',
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('CommerceProduct', 'sku',
      $builder->callback(function ($value, $args, $context, $info) {
        $entity = $value;
        if ($entity && $entity->hasField('sku')) {
          return $entity->get('sku')->value;
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

    // Add to cart mutation.
    $registry->addFieldResolver('Mutation', 'addToCart',
      $builder->callback(function ($value, $args, $context, $info) {
        $productId = $args['productId'];
        $quantity = $args['quantity'] ?? 1;
        
        // For now, we'll simulate adding to cart by returning a mock cart item
        // In a real implementation, you would integrate with Drupal Commerce cart
        $cartItem = [
          'id' => uniqid('cart_item_'),
          'productId' => $productId, // Now accepts string UUID
          'quantity' => $quantity,
          'addedAt' => date('c'), // ISO 8601 format
        ];
        
        return $cartItem;
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
      $builder->callback(function ($value, $args, $context, $info) {
        $productId = $value['productId'];
        $entityTypeManager = \Drupal::entityTypeManager();
        $storage = $entityTypeManager->getStorage('commerce_product');
        // Load by UUID instead of integer ID
        $products = $storage->loadByProperties(['uuid' => $productId]);
        return !empty($products) ? reset($products) : null;
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
