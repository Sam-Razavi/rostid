import type { OpenAPIV3 } from 'openapi-types';

const bearerAuth: OpenAPIV3.SecurityRequirementObject = { bearerAuth: [] };

const errorResponse = (description: string): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
});

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Rostid API',
    version: '1.0.0',
    description:
      'REST API for Rostid — a specialty coffee e-commerce platform. ' +
      'Handles auth, products, cart, orders, checkout (Stripe), subscriptions, loyalty, and more.',
    contact: { name: 'Sam Sahbaei Razavi', url: 'https://github.com/Sam-Razavi/rostid' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: 'http://localhost:4000/api', description: 'Local development' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Access token obtained from POST /auth/login or /auth/register. Expires in 15 minutes; use POST /auth/refresh to renew.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          slug: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          priceOre: { type: 'integer', description: 'Price in öre (1 kr = 100 öre)' },
          roast: { type: 'string', enum: ['light', 'medium', 'dark'] },
          origin: { type: 'string' },
          category: { $ref: '#/components/schemas/Category' },
          variants: { type: 'array', items: { $ref: '#/components/schemas/Variant' } },
          averageRating: { type: 'number', nullable: true },
          reviewCount: { type: 'integer' },
          stock: { type: 'integer' },
          isActive: { type: 'boolean' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          slug: { type: 'string' },
          name: { type: 'string' },
        },
      },
      Variant: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          name: { type: 'string', description: 'e.g. "250g", "500g / Whole Bean"' },
          priceOre: {
            type: 'integer',
            nullable: true,
            description: 'Override price in öre, or null to use product price',
          },
          stock: { type: 'integer' },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          quantity: { type: 'integer' },
          product: { $ref: '#/components/schemas/Product' },
          variant: { $ref: '#/components/schemas/Variant', nullable: true },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
          },
          totalOre: { type: 'integer', description: 'Order total in öre' },
          createdAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                quantity: { type: 'integer' },
                priceOre: { type: 'integer' },
                productName: { type: 'string' },
                variantName: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        description:
          'Returns API and database status. Use this to confirm the server is reachable before making other requests.',
        responses: {
          '200': {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    db: { type: 'string', example: 'connected' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Database unreachable',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'degraded' },
                    db: { type: 'string', example: 'unreachable' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created; access token returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                      },
                    },
                    message: { type: 'string', example: 'User registered' },
                  },
                },
              },
            },
          },
          '409': errorResponse('Email already in use'),
          '422': errorResponse('Validation error'),
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        description:
          'Returns an access token and sets an httpOnly refresh cookie. Rate-limited to 10 requests per 15 minutes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                      },
                    },
                    message: { type: 'string', example: 'Login successful' },
                  },
                },
              },
            },
          },
          '401': errorResponse('Invalid credentials'),
          '429': errorResponse('Too many attempts'),
        },
      },
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description:
          'Reads the httpOnly `refreshToken` cookie and returns a fresh access token. No request body needed.',
        responses: {
          '200': {
            description: 'New access token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { accessToken: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
          '401': errorResponse('Missing or invalid refresh token'),
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out',
        description: 'Invalidates the refresh token and clears the cookie.',
        security: [bearerAuth],
        responses: {
          '200': { description: 'Logged out successfully' },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [bearerAuth],
        responses: {
          '200': {
            description: 'Current authenticated user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': errorResponse('Unauthorized'),
        },
      },
    },

    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        description: 'Paginated, filterable product catalogue. All query params are optional.',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Category slug',
          },
          {
            name: 'roast',
            in: 'query',
            schema: { type: 'string', enum: ['light', 'medium', 'dark'] },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Full-text search on name and description',
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Minimum price in öre',
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Maximum price in öre',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'name_asc'] },
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 50 } },
          {
            name: 'inStock',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter to in-stock products only',
          },
        ],
        responses: {
          '200': {
            description: 'Paginated product list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        products: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Product' },
                        },
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/products/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'yirgacheffe-natural',
          },
        ],
        responses: {
          '200': {
            description: 'Product detail with variants and reviews',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Product' } },
                },
              },
            },
          },
          '404': errorResponse('Product not found'),
        },
      },
    },

    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get cart',
        security: [bearerAuth],
        responses: {
          '200': {
            description: "User's current cart",
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
                        subtotalOre: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': errorResponse('Unauthorized'),
        },
      },
    },

    '/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        security: [bearerAuth],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'string', format: 'cuid' },
                  quantity: { type: 'integer', minimum: 1, maximum: 99, default: 1 },
                  variantId: { type: 'string', format: 'cuid', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Item added' },
          '400': errorResponse('Insufficient stock or invalid product'),
          '401': errorResponse('Unauthorized'),
        },
      },
    },

    '/cart/items/{id}': {
      patch: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: { quantity: { type: 'integer', minimum: 1, maximum: 99 } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Item updated' },
          '401': errorResponse('Unauthorized'),
          '404': errorResponse('Cart item not found'),
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Item removed' },
          '401': errorResponse('Unauthorized'),
        },
      },
    },

    '/orders': {
      get: {
        tags: ['Orders'],
        summary: "List user's orders",
        security: [bearerAuth],
        responses: {
          '200': {
            description: 'Order list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                  },
                },
              },
            },
          },
          '401': errorResponse('Unauthorized'),
        },
      },
    },

    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order detail',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Order with line items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Order' } },
                },
              },
            },
          },
          '401': errorResponse('Unauthorized'),
          '404': errorResponse('Order not found'),
        },
      },
    },

    '/orders/{id}/cancel': {
      patch: {
        tags: ['Orders'],
        summary: 'Cancel an order',
        description: 'Only pending orders can be cancelled. Stock is restored on cancellation.',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Order cancelled' },
          '400': errorResponse('Order cannot be cancelled in its current status'),
          '401': errorResponse('Unauthorized'),
          '404': errorResponse('Order not found'),
        },
      },
    },

    '/checkout/session': {
      post: {
        tags: ['Checkout'],
        summary: 'Create Stripe Checkout session',
        description:
          'Validates the cart, applies discounts/loyalty/gift cards, creates a Stripe Checkout session, ' +
          'and returns the redirect URL. The actual order is created by the Stripe webhook after payment.',
        security: [bearerAuth],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shippingRate: {
                    type: 'string',
                    enum: ['standard', 'express'],
                    default: 'standard',
                  },
                  discountCode: { type: 'string', nullable: true },
                  giftCardCode: { type: 'string', nullable: true },
                  redeemLoyalty: { type: 'boolean', default: false },
                  addressId: { type: 'string', format: 'cuid', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Stripe Checkout URL',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { url: { type: 'string', format: 'uri' } },
                    },
                  },
                },
              },
            },
          },
          '400': errorResponse('Cart is empty or payment not configured'),
          '401': errorResponse('Unauthorized'),
        },
      },
    },
  },
};
