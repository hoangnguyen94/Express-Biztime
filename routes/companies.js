/**Routes for companies */

const express = require( "express" );
const slugify = require( "slugify" );

const db = require( "../db" );
const ExpressError = require( "../expressError" );

let router = new express.Router();

/** GET / => list of companies.
 *
 * =>  {companies: [{code, name, description}, {code, name, descrip}, ...]}
 *
 * */

router.get( '/', async ( req, res, next ) =>
{
    try
    {
      const results = await db.query(
        `SELECT code, name 
        FROM companies
        ORDER BY name` );
      
      return res.json( { "companies": results.rows } )
    } catch ( err )
    {
      return next( err );
    }
} );

/** GET /[code] => detail on company
 *
 * =>  {company: {id, name, description, invoices: [id, ...]}}
 *
 * */

router.get( '/:code', async ( req, res, next ) =>
{
    try
    {
      let code = req.params.code;
      
      const compResult = await db.query(
          `SELECT code, name, description 
          FROM companies
          WHERE code = $1`, [ code ] );
        
      const invResult = await db.query(
          `SELECT id 
          FROM invoices
          WHERE comp_code = $1`, [ code ] );
        
      if ( compResult.rows.length === 0 )
        {
          throw new ExpressError( `No such company: ${code}`, 404 )
        };

      const company = compResult.rows[ 0 ];
      const invoices = invResult.rows;
      
      company.invoices = invoices.map( inv => inv.id )
      
      return res.json( { "company": company } );
    }
    catch ( err )
    {
      return next( err );
    }
} );

/** POST / => add new company
 *
 * {name, description}  =>  {company: {code, name, description}}
 *
 * */

router.post( '/', async ( req, res, next ) =>
{
    try
    {
      let { name, description } = req.body;
      let code = slugify( name, { lower: true } );
      
      const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
        [ code, name, description ] );
      
      return res.status( 201 ).json( { "company": result.rows[ 0 ] } )
    } catch ( err )
    {
      return next( err );
    }
} );

/** PUT /[code] => update company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */

router.put("/:code", async function (req, res, next) {
    try {
      let {name, description} = req.body;
      let code = req.params.code;
  
      const result = await db.query(
            `UPDATE companies
             SET name=$1, description=$2
             WHERE code = $3
             RETURNING code, name, description`,
          [name, description, code]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        return res.json({company: result.rows[0]});
      }
    }
  
    catch (err) {
      return next(err);
    }
} );

/** DELETE /[id] => delete company
 *
 * => {status: "added"}
 *
 */

router.delete("/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const result = await db.query(
            `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
          [code]);
  
      if (result.rows.length == 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        return res.json({"status": "deleted"});
      }
    }
  
    catch (err) {
      return next(err);
    }
} );
  
  
module.exports = router;