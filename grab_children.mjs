// const fetch = require("node-fetch");
// const fs = require('fs');
import fetch from 'node-fetch';
import fs from 'fs';

// const hyperionBaseURL = "https://api.eossweden.org/v2/history/get_actions";
const hyperionBaseURL = 'https://eos.hyperion.eosrio.io/v2/history/get_actions';

async function getActions(url) {
  try {
    console.log('Fetching data from hyperion... url:', url);
    let res = await fetch(url);
    return (await res.json()).actions;
  } catch (e) {
    console.log(e.message);
    return getActions(url);
  }
}

async function grabChildren(account) {
  let children = [];
  let before = '';
  var today = new Date();
  today.setTime(today.getTime() - 24 * 3600000);
  let after = today.toUTCString();
  console.log(after);
  let url = `${hyperionBaseURL}?account=${account}&act.name=newaccount${
    before === '' ? '' : `&after=${after}`
  }`;
  //   let url = `${hyperionBaseURL}?account=${account}&limit=1000&act.name=newaccount${
  //     before === '' ? '' : `&after=${after}`
  //   }`;
  let actions = await getActions(url);
  const newAccounts = actions.map(function (it) {
    return it.act.data.newact;
  });
  children = children.concat(newAccounts);

  //   while (true) {
  //     let url = `${hyperionBaseURL}?account=${account}&limit=1000&act.name=newaccount${
  //       before === '' ? '' : `&before=${before}`
  //     }`;
  //     let actions = await getActions(url);

  //     if (actions.length === 1 && children.includes(actions[0].act.data.newact))
  //       break;

  //     const newAccounts = actions.map(function (it) {
  //       return it.act.data.newact;
  //     });

  //     before = actions[actions.length - 1].timestamp;
  //     console.log(before);
  //     children = children.concat(newAccounts);
  //     console.log(
  //       'Grabbed:',
  //       newAccounts.length,
  //       'Total',
  //       children.length,
  //       newAccounts[0],
  //       newAccounts[newAccounts.length - 1]
  //     );
  //   }

  //remove duplicates, because last account from prev query equals to first account of next query
  return children.filter((v, i, a) => a.indexOf(v) === i);
}

async function grabAndSaveFor(account) {
  let children = await grabChildren(account);
  console.log('Grabbing complete, children length:', children.length);
  fs.writeFileSync(`${account}_children.json`, JSON.stringify(children));
}

grabAndSaveFor('mlt').catch();
