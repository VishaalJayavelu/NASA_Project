const request = require ('supertest');
const app= require('../../app');  
const {mongoConnect,mongoDisconnect} = require('../../services/mongo');
const { loadPlanetData } = require('../../models/planets.model');

describe('Launches API',() => {

     beforeAll(async() => {
          await mongoConnect()
          await loadPlanetData();
     });

     describe('TEST GET /launches', ()=>{
          test('It should response with 200 success', async ()=>{
               const response = await request(app)
               .get('/v1/launches')
               .expect('Content-type',/json/)
               .expect(200);
          });
     });
     
     describe('TEST POST /launches', ()=>{
          const data ={
               mission : 'USS Enterprise',
               rocket : 'NCC 1701-D',
               target : 'Kepler-62 f',
               launchDate : 'January 4, 2028', 
          };
     
          const dataWithoutDate ={
               mission : 'USS Enterprise',
               rocket : 'NCC 1701-D',
               target : 'Kepler-62 f',
          };
     
          const dataWithInvalidDate ={
               mission : 'USS Enterprise',
               rocket : 'NCC 1701-D',
               target : 'Kepler-62 f',
               launchDate : 'zoom', 
          };
     
          test('It should response with 201 success', async ()=>{
               const response= await request(app)
               .post('/v1/launches')
               .send(data)
               .expect('Content-type',/json/)
               .expect(201);
     
               const requestDate = new Date(data.launchDate).valueOf();
               const responseDate = new Date(response.body.launchDate).valueOf();
               
               expect(responseDate).toBe(requestDate);
               expect(response.body).toMatchObject(dataWithoutDate);
          });
     
          test('It should catch missing requierd properties', async()=>{
               const response= await request(app)
               .post('/v1/launches')
               .send(dataWithoutDate)
               .expect('Content-type',/json/)
               .expect(400);
     
               expect(response.body).toStrictEqual({
                    "error": "Missing Values",
               });
          }); 
     
          test('It should catch invalid dates', async()=>{
               const response= await request(app)
               .post('/v1/launches')
               .send(dataWithInvalidDate)
               .expect('Content-type',/json/)
               .expect(400);
     
               expect(response.body).toStrictEqual({
                    "error": "Invalid Date",
               });
          }); 
     });

     afterAll(async() => {
          await mongoDisconnect()
     });

})
