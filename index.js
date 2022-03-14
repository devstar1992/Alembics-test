require("dotenv").config();
const axios = require("axios");
const { formatEther } = require("@ethersproject/units");

const pushToSlack = async (balance, isWarning) => {
    try {
        await axios.post(`${process.env.SLACK}`, {
            content:
                (isWarning ? `Warning\n` : "")+
                "Balance : "+balance+" ETH remained!"
        });
    } catch (err) {
        console.log(err);
    }
};
const pushToDiscord = async (balance, isWarning) => {
    try {
        await axios.post(`${process.env.DISCORD}`, {
            content:
                (isWarning ? `Warning\n` : "")+
                "Balance : "+balance+" ETH remained!"
        });
    } catch (err) {
        console.log(err);
    }
};
const pushToTelegram = async (balance, isWarning) => {
    try {
        await axios.post(`${process.env.TELEGRAM}`, {
            content:
                (isWarning ? `Warning\n` : "")+
                "Balance : "+balance+" ETH remained!"
        });
    } catch (err) {
        console.log(err);
    }
};
const pushNotification = (balance, isWarning) => {
    pushToSlack(balance, isWarning);
    pushToDiscord(balance, isWarning);
    pushToTelegram(balance, isWarning);
}

const reconnector = new ReconnectableEthers();
reconnector.load({
    PROVIDER_ADDRESS: WSS_ENDPOINTS[ele]
});
reconnector.provider.on("block", async (blockNumber) => {
    const balance = await reconnector.provider.getBalance(process.env.ACCOUNT);
    if (Number(formatEther(balance)) < Number(process.env.AMOUNT_LIMIT)) {
        //push notification
        pushNotification(balance, true);
    }
});
const checkBalance = () => {
    setTimeout(checkBalance, 24 * 3600 * 1000);
    const balance = await reconnector.provider.getBalance(process.env.ACCOUNT);
    //push notification
    pushNotification(balance, Number(formatEther(balance)) < Number(process.env.AMOUNT_LIMIT));
}

const toNextTime = new Date();
toNextTime.setHours(process.env.HOUR, process.env.MINUTE, 0, 0);
if (toNextTime.getTime() < Date.now()) {
    toNextTime.setDate(toNextTime.getDate() + 1);
}
setTimeout(checkBalance, toNextTime.getTime() - Date.now());
