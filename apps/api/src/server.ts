import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3001);

app.set("isProduction", process.env.NODE_ENV === "production");
app.listen(port, () => {
  console.log(`FamilyTODO API listening on port ${port}`);
});
