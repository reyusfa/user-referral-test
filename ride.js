const db = require('./mysql');

db.connect();

// SHOW ALL USERS
const selectAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT *
      FROM user`,
    (err, res) => {
      if(err) reject(err);
      resolve(res);
    });
  });
};

// SHOW USER BY ID
const selectUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT *
      FROM user
      WHERE id = ?`, [id],
    (err, res) => {
      if(err) reject(err);
      resolve(res[0]);
    });
  });
};

// SHOW DESCENDANTS BY ID
const selectDescendantsById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT
        referral.id AS referral_id,
        referral.name AS referral_name,
        ancestor.id AS ancestor_id,
        ancestor.name AS ancestor_name,
        descendant.id AS descendant_id,
        descendant.name AS descendant_name,
        referral_user.distance AS level
      FROM
        referral_user
      LEFT JOIN
        user AS referral
        ON referral_user.referral_id = referral.id
      LEFT JOIN
        user AS ancestor
        ON referral_user.ancestor_id = ancestor.id
      LEFT JOIN
        user AS descendant
        ON referral_user.descendant_id = descendant.id
      WHERE
        referral_user.ancestor_id = ?`, [id],
    (err, res) => {
      if(err) reject(err);
      resolve(res);
    });
  });
};

// SHOW DESCENDANTS BY LEVEL
const selectDescendantsByLevel = (id, level) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT
        referral.id AS referral_id,
        referral.name AS referral_name,
        ancestor.id AS ancestor_id,
        ancestor.name AS ancestor_name,
        descendant.id AS descendant_id,
        descendant.name AS descendant_name,
        referral_user.distance AS level
      FROM
        referral_user
      LEFT JOIN
        user AS referral
        ON referral_user.referral_id = referral.id
      LEFT JOIN
        user AS ancestor
        ON referral_user.ancestor_id = ancestor.id
      LEFT JOIN
        user AS descendant
        ON referral_user.descendant_id = descendant.id
      WHERE
        referral_user.ancestor_id = ?
        AND referral_user.distance = ?`, [id, level],
    (err, res) => {
      if(err) reject(err);
      resolve(res);
    });
  });
};

// COUNT DESCENDANTS BY ID
const countAllDescendantsById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT COUNT(*) AS descendants_count
      FROM referral_user
      WHERE ancestor_id = ?`, [id],
    (err, res) => {
      if(err) reject(err);
      resolve(res[0]);
    });
  });
};

// COUNT DESCENDANTS BY LEVEL
const countDescendantsByLevel = (id, level) => {
  return new Promise((resolve, reject) => {
    if(level >= 1 && level <= 5) {
      db.query(`
        SELECT
          COALESCE(distance, ${level}) AS level,
          COUNT(*) AS descendants_count
        FROM
          referral_user
        WHERE
          ancestor_id = ?
          AND distance = ?`, [id, level],
      (err, res) => {
        if(err) reject(err);
        resolve(res[0]);
      });
    } else {
      reject({error: 'level is not valid!'});
    }
  });
};

/***
  #CASE:

  F join using referral of E
  E is descendant of D
  D is descendant of C
  C is descendant of B
  B is descendant of A

  insert into
    referral_user
    (referral_id, ancestor_id, descendant_id, distance)
  values
    (E, E, F, 1),
    (E, D, F, 2),
    (E, C, F, 3),
    (E, B, F, 4),
    (E, A, F, 5)
*/
const addDescendant = ({referral_id = null, ancestor_id = null, descendant_id = null}) => {
  return new Promise(async (resolve, reject) => {
    for(let i = 1; i <= 5; i++) {
      let count = await countDescendantsByLevel(referral_id, i).then(res => {
        const descendants = res.descendants_count
        if(descendants && typeof descendants === 'number') {
          return descendants;
        } else {
          return 0;
        }
      });
      let line = Math.pow(2, i);
      console.log(`${count}/${line}`);
      // logic
    }
  });
};

// SHOW ANCESTOR BY ID
const selectAncestorById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT
        *
      FROM
        referral_user
      WHERE descendant_id = ?`, [id],
    (err, res) => {
      if(err) reject(err);
      resolve(res[0]);
    });
  });
};

// selectAllUsers().then(console.log).catch(console.log);
countAllDescendantsById(2).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 0).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 1).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 2).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 3).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 4).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 5).then(console.log).catch(console.log);
// countDescendantsByLevel(1, 6).then(console.log).catch(console.log);
selectDescendantsById(2).then(console.log).catch(console.log);
// selectDescendantsByLevel(1, 2).then(console.log).catch(console.log);

selectAncestorById(3).then(console.log).catch(console.log);
