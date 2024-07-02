import { RestaurantCategory } from '../../models/models.js'
import { check } from 'express-validator'

const checkNonExistingCategory = async (value, req) => {
  try {
    const category = await RestaurantCategory.findOne({ where: { name: value }
    })
    if (category) {
      return Promise.reject(new Error('This category already exists'))
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}


const create = [
  check('name').isString().isLength({ min: 1, max: 50 }).trim(),
  check('name').custom((value, { req }) => {  
  return checkNonExistingCategory(value, req)
  })
]

export { create }