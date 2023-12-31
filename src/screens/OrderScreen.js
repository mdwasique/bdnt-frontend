   import Axios from 'axios';
import { PayPalButton } from 'react-paypal-button-v2';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { detailsOrder } from '../actions/orderActios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const OrderScreen = (props) => {
  const orderId = props.match.params.id;

  const [sdkReady, setSdkReady] = useState(false);

  const orderDetails = useSelector((state) => state.orderDetails);

  const { order, loading, error } = orderDetails;

  const dispatch = useDispatch();

  useEffect(() => {
    const addPayPalScript = async () => {
      const { data } = await Axios.get('/api/config/paypal');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${data}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };

      document.body.appendChild(script);
    };
    if (!order) {
      dispatch(detailsOrder(orderId));
    } else {
      if (!order.isPaid) {
        if (!window.paypal) {
          addPayPalScript();
        } else {
          setSdkReady(true);
        }
      }
    }
  }, [dispatch, sdkReady, order, orderId]);

  const successPaymentHandler = () => {
    //todo success
  };

  return (
    <div>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div className="background">
          <h1>Order {order._id}</h1>
          <div className="row top">
            <ul>
              <li>
                <div className="card-body card">
                  <h2>Shipping</h2>
                  <p>
                    <strong>Name: </strong>
                    {order.shippingAddress.fullName}
                    <br />
                    <strong>Address: </strong>
                    {order.shippingAddress.address},{order.shippingAddress.city}
                    ,{order.shippingAddress.postalCode},
                    {order.shippingAddress.country},
                  </p>
                  {order.isDelivered ? (
                    <MessageBox variant="success">
                      Delivered at {order.deliveredAt}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Delivered</MessageBox>
                  )}
                </div>
              </li>
              <li>
                <div className="card-body card">
                  <h2>Payment</h2>
                  <p>
                    <strong>Method:</strong>
                    {order.paymentMethod}
                  </p>
                  {order.isPaid ? (
                    <MessageBox variant="success">
                      Paid at {order.paidAt}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Paid</MessageBox>
                  )}
                </div>
              </li>
              <li>
                <div className="card-body card">
                  <h2>Order Items</h2>
                  <ul>
                    {order.orderItems.map((item) => (
                      <li key={item.product}>
                        <div className="row">
                          <div>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="small"
                            ></img>
                          </div>
                          <div className="min-30">
                            <Link to={`/product/${item.product}`}>
                              <strong>{item.name}</strong>
                            </Link>
                          </div>

                          <div>
                            <strong>
                              {item.qty} x ${item.price} = $
                              {item.qty * item.price}
                            </strong>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
            <div className="col-1">
              <div className="card-body card">
                <ul>
                  <li>
                    <h2>Order Summary</h2>
                  </li>
                  <li>
                    <div className="row">
                      <div>Items</div>
                      <div>${order.itemsPrice}</div>
                    </div>
                  </li>
                  <li>
                    <div className="row">
                      <div>Shipping</div>
                      <div>${order.shippingPrice}</div>
                    </div>
                  </li>
                  <li>
                    <div className="row">
                      <div>Tax</div>
                      <div>${order.taxPrice}</div>
                    </div>
                  </li>
                  <li>
                    <div className="row">
                      <div>
                        <strong>Order Total:</strong>
                      </div>
                      <div>
                        <strong>${order.totalPrice}</strong>
                      </div>
                    </div>
                  </li>
                  {!order.isPaid && (
                    <li>
                      {sdkReady ? (
                        <LoadingBox></LoadingBox>
                      ) : (
                        <div className="card-body card adjust ">
                          <div>
                            <PayPalButton
                              amount={order.totalPrice}
                              onSuccess={successPaymentHandler}
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;
