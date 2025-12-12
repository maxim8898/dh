<?php

namespace Drupal\dh_graph\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Event subscriber to add CORS headers to GraphQL responses.
 */
class GraphQLCorsSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    // Run after the CORS service but before response is sent.
    $events[KernelEvents::RESPONSE][] = ['onResponse', 5];
    return $events;
  }

  /**
   * Adds CORS headers to GraphQL endpoint responses.
   *
   * @param \Symfony\Component\HttpKernel\Event\ResponseEvent $event
   *   The response event.
   */
  public function onResponse(ResponseEvent $event) {
    $request = $event->getRequest();
    $response = $event->getResponse();

    // Only process GraphQL requests.
    if (strpos($request->getPathInfo(), '/graphql') !== 0) {
      return;
    }

    // Get the origin from the request.
    $origin = $request->headers->get('Origin');

    if (!$origin) {
      return;
    }

    // List of allowed origins.
    $allowed_origins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000',
      'https://127.0.0.1:3000',
      'http://dh.ddev.site:9999',
      'https://dh.ddev.site:9999',
    ];

    // Check if origin is allowed.
    if (in_array($origin, $allowed_origins)) {
      $response->headers->set('Access-Control-Allow-Origin', $origin);
      $response->headers->set('Access-Control-Allow-Credentials', 'true');
      $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
      $response->headers->set('Vary', 'Origin');
    }
  }

}
