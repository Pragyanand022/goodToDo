import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client(
  {
    user: 'postgres',
    database: 'goodToDo',
    password: 'pnsql',
    host: 'localhost',
    port: 5432
  } 
);

db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItems(){
  const result = await db.query('select* from items order by id ASC;');
  const items = result.rows;
  console.log(items);
  return items;
}

app.get("/", async(req, res) => {

  try{
    items = await getItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items
    });
  }catch(err){
    res.send(err.message);
  }

});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  try{
    await db.query('insert into items (title) values ($1);', [item]);
    res.redirect("/");
  }
  catch(err){ 
    res.send(err);
  }
  
});

app.post("/edit", async(req, res) => {
  const itemId = req.body.updatedItemId;
  const itemTitle = req.body.updatedItemTitle;
  try{
    await db.query('update items set title = $1 where id = $2;', [itemTitle, itemId]);
    res.redirect('/');
  } catch(err){
    res.send(err);
  }
});

app.post("/delete", async(req, res) => {
  const currId = req.body.deleteItemId;
  try{
    await db.query('delete from items where id = $1', [currId]);
    res.redirect('/');
  }
  catch(err){
    res.send(err);
  }
});

app.post('/finish/:id', async(req,res)=>{
  const currId = req.params.id;
  const isFinished = req.body.finishItem == 'true'? true:false;

  console.log(req.body);
  console.log(isFinished);

  await db.query('update items set finish = ($1) where id = $2;', [isFinished, currId])
  .then(()=>{
    res.redirect('/');

  }).catch(err=>{
    res.send(err);
  })
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

