const { getIdentityStorage } = require("../utils/getIdentityStorage");
const { getSubIdentitiesCollection } = require("@statescan/mongo/src/identity");
const { getCurrentBlockTimestamp } = require("../utils/unitConversion");

async function handleSubIdentityExtrinsics(extrinsic, indexer, method) {
  console.log("handleSubIdentityExtrinsics");

  let subIdentityList = [];
  const parentId = extrinsic.signer.toString();
  const parentIdentity = await getIdentityStorage(parentId);
  const timestamp = await getCurrentBlockTimestamp(indexer);

  const extrinsicData = extrinsic.method.args[0];
  extrinsicData.forEach(([subAccountId, subDisplay]) => {
    console.log(`subAccountId`, subAccountId.toHuman());
    console.log(`subDisplay`, subDisplay.toHuman());

    let subIdentity = {
      parentIdentityAccountId: parentId,
      requestTimestamp: timestamp,
      accountId: subAccountId.toHuman(),
      subIdentityAccountId: subAccountId.toHuman(),
      status: method,
    };
    subIdentity = { ...parentIdentity, ...subIdentity };
    subIdentity.info.display = subDisplay.asRaw.toUtf8();
    subIdentityList.push(subIdentity);
  });

  console.log(`subIdentityList`, subIdentityList);
  await bulkUpdateSubIdentities(subIdentityList);
}

async function bulkUpdateSubIdentities(registrars) {
  const subIdentityCollection = await getSubIdentitiesCollection();

  const operations = registrars.map((subIdentity) => ({
    updateOne: {
      filter: { _id: subIdentity.accountId },
      update: { $set: subIdentity },
      upsert: true,
    },
  }));

  await subIdentityCollection.bulkWrite(operations);
}

module.exports = {
  handleSubIdentityExtrinsics,
};
