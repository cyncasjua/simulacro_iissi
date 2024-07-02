module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      price: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      basePrice: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      image: {
        type: Sequelize.STRING
      },
      order: {
        type: Sequelize.INTEGER
      },
      availability: {
        type: Sequelize.BOOLEAN
      },
      visibleUntil: {
        type: Sequelize.DATE
      },
      fats: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.0
      },
      proteins: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.0
      },
      carbohydrates: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.0
      },
      calories: {
        allowNull: false,
        type: Sequelize.DOUBLE,
        defaultValue: 0.0
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Restaurants'
          },
          key: 'id'
        },
        onDelete: 'cascade'
      },
      productCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'ProductCategories'
          },
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products')
  }
}
