import {sequelizeSession, Restaurant, Product, RestaurantCategory, ProductCategory } from '../models/models.js'
import { Sequelize } from 'sequelize'

const index = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        include:
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      },
        order: [[{ model: RestaurantCategory, as: 'restaurantCategory' }, 'name', 'ASC']]
      }
    )
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

async function _getPinnedRestaurants (req) {
  return await Restaurant.findAll({
    attributes: { exclude: ['userId'] },
    where: {
      userId: req.user.id,
      pinnedAt: {
        [Sequelize.Op.not]: null // Uso de Sequelize.Op.not para filtrar no nulos
      }
    },
    order: [['pinnedAt', 'ASC']], // Ordenados ascendente por 'pinnedAt'
    include: [{
      model: RestaurantCategory,
      as: 'restaurantCategory'
    }]
  })
}

async function _getNoPinnedRestaurants (req) {
  return await Restaurant.findAll({
    attributes: { exclude: ['userId'] },
    where: {
      userId: req.user.id,
      pinnedAt: null
    },
    order: [['pinnedAt', 'ASC']], // Ordenados ascendente por 'pinnedAt'
    include: [{
      model: RestaurantCategory,
      as: 'restaurantCategory'
    }]
  })
}

const indexOwner = async function (req, res) {
  try {
    const restaurants = [...(await _getPinnedRestaurants(req)),...(await _getNoPinnedRestaurants(req))]
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}


const create = async function (req, res) {
  const newRestaurant = Restaurant.build(req.body)
  newRestaurant.userId = req.user.id // usuario actualmente autenticado
  newRestaurant.pinnedAt = req.body.pinned ? new Date() : null
  try {
    const restaurant = await newRestaurant.save()
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  try {
    const currentDate = new Date();
    const restaurant = await Restaurant.findByPk(req.params.restaurantId, {
      attributes: { exclude: ['userId'] },
      include: [
        {
          model: Product,
          as: 'products',
          where: {
            visibleUntil: {
              [Sequelize.Op.or]: [
                { [Sequelize.Op.eq]: null },
                { [Sequelize.Op.gt]: currentDate }
              ]
            }
          },
          include: {
            model: ProductCategory,
            as: 'productCategory'
          }
        },
        {
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }
      ],
      order: [[{ model: Product, as: 'products' }, 'order', 'ASC']]
    });

    res.json(restaurant);
  } catch (err) {
    res.status(500).send(err);
  }
};


const update = async function (req, res) {
  try {
    const transaction = await sequelizeSession.transaction()
    await Restaurant.update(req.body, { where: { id: req.params.restaurantId } },transaction)

    const productsToBeUpdated = await Product.findAll({
      where: { restaurantId: req.params.restaurantId },
    });

    for(const p of productsToBeUpdated){
      const newPrice = p.basePrice + p.basePrice * (req.body.percentage / 100);
      await p.update({price:newPrice},transaction);
    }
    await transaction.commit();
    
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const destroy = async function (req, res) {
  try {
    const result = await Restaurant.destroy({ where: { id: req.params.restaurantId } })
    let message = ''
    if (result === 1) {
      message = 'Sucessfuly deleted restaurant id.' + req.params.restaurantId
    } else {
      message = 'Could not delete restaurant.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

/*const togglePinned = async function (req, res) {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    await Restaurant.update(
      { pinnedAt: restaurant.pinnedAt ? null : new Date() },  //si el valor de pinnedAt no es null se establece null y al reves 
      { where: { id: restaurant.id } }
    )
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}*/

const togglePinned = async function (req, res) {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if(!restaurant.pinnedAt){
      restaurant.pinnedAt = new Date()
    }else{
      restaurant.pinnedAt = null
    }
    await restaurant.save()
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const RestaurantController = {
  index,
  indexOwner,
  create,
  show,
  update,
  destroy,
  togglePinned
}
export default RestaurantController
