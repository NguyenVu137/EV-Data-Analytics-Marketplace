const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function checkDb(p) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(p, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.log(`DB: ${p} -> error opening: ${err.message}`);
        return resolve();
      }
      db.get("SELECT count(*) as c FROM User", (err1, row1) => {
        const users = (row1 && row1.c) || 0;
        db.get("SELECT count(*) as c FROM Dataset", (err2, row2) => {
          const datasets = (row2 && row2.c) || 0;
          console.log(`DB: ${p}`);
          console.log(`  Users: ${users}`);
          console.log(`  Datasets: ${datasets}`);
          db.close(() => resolve());
        });
      });
    });
  });
}

(async () => {
  const f1 = path.resolve(__dirname, 'sqlite-dev.db');
  const f2 = path.resolve(__dirname, 'backend', 'sqlite-dev.db');
  console.log('Inspecting DB files:');
  console.log(' -', f1);
  console.log(' -', f2);
  await checkDb(f1);
  await checkDb(f2);
})();
