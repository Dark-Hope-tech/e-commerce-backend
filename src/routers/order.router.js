import { Router } from 'express';
import handler from 'express-async-handler';
import auth from '../middleware/auth.mid.js';
import { BAD_REQUEST } from '../constants/httpStatus.js';
import { OrderModel } from '../models/order.model.js';
import { OrderStatus } from '../constants/orderStatus.js';
import { UserModel } from '../models/user.model.js';
import { sendEmailReceipt } from '../helpers/mail.helper.js';
import {UNAUTHORIZED} from '../constants/httpStatus.js';
const router = Router();
router.use(auth);

router.post(
  '/create',
  handler(async (req, res) => {
    const order = req.body;

    if (order.items.length <= 0) res.status(BAD_REQUEST).send('Cart Is Empty!');

    const newOrder = new OrderModel({ ...order, user: req.user.id });
    await newOrder.save();

    res.send(newOrder);
  })
);

router.put(
  '/pay',
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send('Order Not Found!');
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    sendEmailReceipt(order);

    res.send(order._id);
  })
);

router.get(
  '/track/:orderId',
  handler(async (req, res) => {
    const { orderId } = req.params;
    const user = await UserModel.findById(req.user.id);

    const filter = {
      _id: orderId,
    };

    if (!user.isAdmin) {
      filter.user = user._id;
    }

    const order = await OrderModel.findOne(filter);

    if (!order) return res.send(UNAUTHORIZED);

    return res.send(order);
  })
);

router.get(
  '/newOrderForCurrentUser',
  handler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) res.send(order);
    else res.status(BAD_REQUEST).send();
  })
);

router.get('/allstatus', (req, res) => {
  const allStatus = Object.values(OrderStatus);
  res.send(allStatus);
});

router.get(
  '/:status?',
  handler(async (req, res) => {
    const status = req.params.status;
    const user = await UserModel.findById(req.user.id);
    const filter = {};

    if (!user.isAdmin) filter.user = user._id;
    if (status) filter.status = status;

    const orders = await OrderModel.find(filter).sort('-createdAt');
    res.send(orders);
  })
);
router.post('/markPaid',
  handler(async (req, res) => {
    const order =  await OrderModel.findById(req.body.id);
    if (!order) {
      res.status(BAD_REQUEST).send('Order Not Found!');
      return;
    }
    order.status = OrderStatus.PAYED;
    await order.save();
    res.status(200).send({isSuccess: true});
  })
);

router.post('/markCancelled',
  handler(async (req, res) => {
    const order =  await OrderModel.findById(req.body.id);
    if (!order) {
      res.status(BAD_REQUEST).send('Order Not Found!');
      return;
    }
    order.status = OrderStatus.CANCELED;
    await order.save();
    res.status(200).send({isSuccess: true});
  })
);

router.delete('/deleteOrder', handler(async (req, res) => {
  try {
    const orderId = req.body.id; // Assuming req.body.id contains the ID of the order to delete

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(400).send('Order Not Found!');
    }

    await order.deleteOne(); // Delete the order from the database

    res.status(200).send({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).send('Internal Server Error');
  }
}));


const getNewOrderForCurrentUser = async req =>
  await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.NEW,
  }).populate('user');
export default router;
