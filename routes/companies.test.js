/** Tests for companies */

process.env.NODE_ENV = "test";

const request = require( "supertest" );

const app = require( "../app" );
const {createData} = require("../_test-common")
const db = require( "../db" );

/** before each test clear data*/

beforeEach( createData );

afterAll( () => {
    db.end()
} );


describe( "GET /", function ()
{
    test( "It should return companies", async () =>
    {
        const res = await request( app ).get( "/companies" );
        console.log( res );
        expect( res.body ).toEqual( {
            "companies": [
                { code: "apple", name: "Apple" },
                { code: "ibm", name: "IBM" },
            ]
        } );
    } )
} );

describe( "GET /apple", () =>
{
    test( "It return company information", async () =>
    {
        const res = await request( app ).get( "/companies/apple" );
        expect( res.body ).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "Apple",
                    description: "Maker of OSX.",
                    invoices: [ 1, 2 ]
                }
            }
        );
    } );

    test( "Should return 404 for no company", async () =>
    {
        const res = await request( app ).get( "/companies/dontknow" );
        expect( res.status ).toEqual( 404 );
    } );
} );

describe( "POST /", () =>
{
    test( "should add company", async () =>
    {
        const res = await request( app )
            .post( "/companies" )
            .send( { name: "TalkTalk", description: "Noise" } );
        expect( res.body ).toEqual(
            {
                "company": {
                    code: "talktalk",
                    name: "TalkTalk",
                    description: "Noise"
                }
            }
        );
    } );

    test( "It should return 500 for conflict", async () =>
    {
        const response = await request(app)
            .post("/companies")
            .send({name: "Apple", description: "Huh?"});
    
        expect(response.status).toEqual(500);
      })
} );
    
describe( "PUT /", () =>
{
    test( "It should update company", async () =>
    {
      const response = await request(app)
          .put("/companies/apple")
          .send({name: "ApplePie", description: "new me"});
  
      expect(response.body).toEqual(
          {
            "company": {
              code: "apple",
              name: "ApplePie",
              description: "new me",
            }
          }
      );
    } );
    
  
    test( "It should return 404 for no-such-comp", async () =>
    {
      const response = await request(app)
          .put("/companies/dontknow")
          .send({name: "dontknow"});
  
      expect(response.status).toEqual(404);
    });
  
    test( "It should return 500 for missing data", async () =>
    {
      const response = await request(app)
          .put("/companies/apple")
          .send({});
  
      expect(response.status).toEqual(500);
    })
} );
  
  
  
describe( "DELETE /", () => 
{  
    test( "It should delete company", async () =>
    {
      const response = await request(app)
          .delete("/companies/apple");
  
      expect(response.body).toEqual({"status": "deleted"});
    });
  
    test( "It should return 404 for no-such-comp", async () =>
    {
      const response = await request(app)
          .delete("/companies/blargh");
  
      expect(response.status).toEqual(404);
    });
} );
