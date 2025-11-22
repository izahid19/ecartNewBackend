const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Kart API',
      version: '1.0.0',
      description: 'API documentation for E-Commerce Kart Backend',
      contact: {
        name: 'API Support',
        email: 'mushtaqzahid888@gmail.com',
      },
    },
    servers: [
      {
        url: 'https://ecartnewbackend-production.up.railway.app/api',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
