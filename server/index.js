
const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation  
} = require('./db');

const express = require('express')
const app = express()

app.get('/api/customers', async(req, res, next)=> {
  try {
    res.send(await fetchCustomers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/restaurants', async(req, res, next)=> {
  try {
    res.send(await fetchRestaurants());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/reservations', async(req, res, next)=> {
  try {
    res.send(await fetchReservations());
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/customers/:id/reservations', async (req, res, next) => {
  try {
    res.status(201).send(await createReservation(req.body));
  } catch (ex) {
    next(ex);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', 
async(req, res, next)=> {
  try {
    await destroyReservation(req.params.id);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [moe, lucy, ethyl, oliveGarden, chillis, texasRoadhouse, appleBees] = await Promise.all([
    createCustomer('moe'),
    createCustomer('lucy'),
    createCustomer('ethyl'),
    createRestaurant('oliveGarden'),
    createRestaurant('chillis'),
    createRestaurant('texasRoadhouse'),
    createRestaurant('appleBees')
  ]);
  console.log(`moe has an id of ${moe.id}`);
  console.log(`chillis has an id of ${oliveGarden.id}`);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());
  await Promise.all([
    createReservation({ 
      customer_id: moe.id, 
      restaurant_id: oliveGarden.id, 
      reservation_date_date: '04/01/2024',
      party_count: 4,
    }),

    createReservation({ 
      customer_id: ethyl.id, 
      restaurant_id: chillis.id, 
      reservation_date: '04/15/2024',
      party_count: 5,
    }),

    createReservation({ 
      customer_id: lucy.id, 
      restaurant_id: texasRoadhouse.id, 
      reservation_date: '07/04/2024',
      party_count: 4,
    }),

    createReservation({ 
      customer_id: lucy.id, 
      restaurant_id: appleBees.id, 
      reservation_date: '10/31/2024',
      party_count: 4,
    }),
  ]);
  const reservations = await fetchReservations();
  console.log(reservations);
  await destroyReservation(reservations[0].id);
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};



init();