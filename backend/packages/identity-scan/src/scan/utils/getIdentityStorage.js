const {
  chain: { getApi },
} = require("@osn/scan-common");
const { toDecimal128 } = require("@statescan/common/src/utils/toDecimal128");

async function getIdentityStorage(accountId) {
  const api = await getApi();
  let identity = {};
  identity.accountId = accountId;

  const identityInfo = await api.query.identity.identityOf(accountId);

  if (!identityInfo.isSome) {
    return identity;
  }

  const { info, judgements, deposit } = identityInfo.unwrap();
  identity.info = {
    display: info.display.asRaw.toUtf8(),
    legal: info.legal.asRaw.toHuman(),
    web: info.web.asRaw.toHuman(),
    riot: info.riot.asRaw.toHuman(),
    email: info.email.asRaw.toHuman(),
    image: info.image.asRaw.toHuman(),
    twitter: info.twitter.asRaw.toHuman(),
    pgpFingerprint: info.pgpFingerprint.isSome
      ? info.pgpFingerprint.unwrap().toHex()
      : null,
  };
  identity.deposit = await toDecimal128(deposit);
  if (judgements.length > 0) {
    identity.judgements = setIdentityJudgements(identity, judgements);
  }
  identity.accountId = accountId;
  console.log("getIdentityStorage", identity);
  return identity;
}

function setIdentityJudgements(identity, judgements) {
  const judgementsList = [];

  if (judgements.length > 0) {
    judgements.forEach(([registrarIndex, judgement]) => {
      let judgementInfo = {
        registrarIndex: registrarIndex.toNumber(),
        judgement: judgement.toString(),
      };
      judgementsList.push(judgementInfo);
    });
  }

  return judgementsList;
}

module.exports = {
  getIdentityStorage,
};
