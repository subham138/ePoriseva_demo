const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const request = require('request');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
var agntId = "IN01IN03AGT000000002";
var keyword = "AIAGT$20170704";
// const payModule = require('../models/pay_model');
// const pay_model = new payModule();

// DEFINE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// LOGIN INDEX
const index = (req, res, next) => {
    let user = req.session.user;
    // console.log(user);
    if (user) {
        res.render('pay/biller_select');
    } else {
        res.redirect('/login');
    }
};

// GENERATE AGENTREFNO
const AgentRefNo = (min, max) => {
    return new Promise((resolve, reject) => {
        resolve(Math.floor(
            Math.random() * (max - min + 1) + min
        ));
    })
}

const get_biller = (cat_id, coverage, data, type) => {
    try {
        return new Promise((resolve, reject) => {
            var states = '';
            var body_data = type == '1' ?
                ((cat_id == '1' || cat_id == '3') ? '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><CatId>' + cat_id + '</CatId><Coverage>' + coverage + '</Coverage></root>' : '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><CatId>' + cat_id + '</CatId></root>') :
                (type == '3' ? '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrName>' + data + '</BlrName></root>' :
                    (type == '4' ? '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrId>' + data + '</BlrId></root>' : ''));
            // console.log(body_data);
            var options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetBillers',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: body_data

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    states = JSON.stringify(result.Response.Msg[0].Billers[0].Biller);
                    // console.log(data);
                });
                resolve(states);
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const params = (biller_id, accpt_type) => {
    try {
        return new Promise((resolve, reject) => {
            var params_data = accpt_type == '1' ? '<ReqTypes><Req>BR</Req></ReqTypes><ReqTypes><Req>PR</Req></ReqTypes>' : '<ReqTypes><Req>BR</Req></ReqTypes>';
            var options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetParameters',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<Params><Param>' + params_data + '<AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrId>' + biller_id + '</BlrId><PayChannel>INT</PayChannel><PayMode>Internet Banking</PayMode><QuickPay>0</QuickPay></Param></Params>'

            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    params_data = JSON.stringify(result.Response.Msg[0].Params[0].Param);
                    // console.log(data);
                });
                resolve(params_data);
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const pay_mode = (blr_id) => {
    try {
        return new Promise((resolve, reject) => {
            // var params_data = '<bills><bill><AgntId>'+ agntId +'</AgntId><Keyword>'+ keyword +'</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>';
            // console.log(params_data);
            var bill_mode = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/GetPayModes',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<root><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><BlrId>' + blr_id + '</BlrId></root>'

            };
            request(bill_mode, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    // ref_id = JSON.stringify(result.Response.RefId[0]);
                    mode_data = JSON.stringify(result.Response.Msg[0].Root[0].PayMode);
                    // console.log(mode_data);
                });
                resolve(mode_data);
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const get_bill = (agent_ref_id, body_data) => {
    try {
        return new Promise((resolve, reject) => {
            var params_data = '<bills><bill><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>';
            // console.log(params_data);
            var bill_options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/FetchBill',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<bills><bill><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><PayChannel>AGT</PayChannel><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_data + '</bill></bills>'

            };
            request(bill_options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    ref_id = JSON.stringify(result.Response.RefId[0]);
                    bill_data = JSON.stringify(result.Response.BillerResponse[0].Row);
                    // console.log(JSON.stringify(result));
                });
                resolve({ bill_data, ref_id });
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const bill_pay = (ag_ref_id, ref_id, blr_id, mode, amt, type, req_body) => {
    try {
        return new Promise((resolve, reject) => {
            var params_data = type > 0 ? req_body : '<Payments><Payment><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + ag_ref_id + '</AgntRefId><RefId>' + ref_id + '</RefId><BlrId>' + blr_id + '</BlrId><PayMode>' + mode + '</PayMode><DebitBranch>INDB000018</DebitBranch><DebitAcNo>AIAGTAC001</DebitAcNo><BillAmt>' + amt + '</BillAmt><DebitNar1>test</DebitNar1><PayChannel>AGT</PayChannel><SplitAmt>0</SplitAmt><SplitPay>No</SplitPay><CCF>0</CCF><TotalAmt>' + amt + '</TotalAmt><Field37>' + amt + '</Field37><QuickPay>0</QuickPay></Payment></Payments>';
            // console.log(params_data);
            var pay_req = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/HubComfort/COUHubComfort/PayBill',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: params_data

            };
            request(pay_req, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    const data = JSON.stringify(result);
                    // console.log(data);
                    txnref_no = JSON.stringify(result.Response.TxnRefId[0]);
                    msg = JSON.stringify(result.Response.Msg[0]);
                    pay_data = JSON.stringify(result.Response.BillerResponse[0].Row);
                    code = result.Response.Code[0];
                    // console.log(data);
                    // console.log(pay_data);
                });
                resolve({ pay_data, txnref_no, msg, code });
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const fetch_plans = (BlrId) => {
    try {
        return new Promise((resolve, reject) => {
            // console.log(params_data);
            var bill_options = {
                'method': 'POST',
                'url': 'https://ibluatapig.indusind.com/app/uat/COUHubComfort/GetPlandetails',
                'headers': {
                    'X-IBM-Client-Secret': 'uQ1cQ3qB0jG6rP0qY1pF2wB8eQ1lO6oJ0eJ7pK1eG2bB0iD3kV',
                    'X-IBM-Client-Id': '3b67954e-0045-4455-9a94-2b98a82c07d7',
                    'Content-Type': 'application/xml',
                    'Cookie': 'ASP.NET_SessionId=eprlnvyulnga5rpjvsbqovt1'
                },
                body: '<root><AgntId>IN01IN03AGT000000002</AgntId><Keyword>AIAGT$20170704</Keyword><BlrId>' + BlrId + '</BlrId></root>'

            };
            request(bill_options, function (error, response) {
                if (error) throw new Error(error);
                const xml = response.body;
                xml2js.parseString(xml, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    console.log(result);
                    resolve(result.Response.Msg[0].Plans[0].Plan)
                    // ref_id = JSON.stringify(result.Response.RefId[0]);
                    // bill_data = JSON.stringify(result.Response.BillerResponse[0].Row);
                    // console.log(JSON.stringify(result));
                });
                // resolve({ bill_data, ref_id });
            });
        });

    } catch (err) {
        console.log({ "msg": err });
    }
}

const send_text_msg = (phone_no, amount, biller_name, consumer_no, tnx_id, date, mode) => {
    var to = '9051203118'; // phone_no;
    var text = 'Thank%20you%20for%20the%20bill%20'
        + 'payment%20of%20' + amount + '%20'
        + 'against%20' + biller_name + '%20,%20'
        + 'Consumer%20No.%20' + consumer_no + '%20,'
        + 'Transaction%20ref%20ID%20' + tnx_id + '%20'
        + 'received%20on%20' + date + '%20'
        + 'vide%20' + mode
        + '.-SYNERGIC%20SOFTEK%20SOLUTIONS%20PVT.%20LTD.';
    console.log(text);
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': 'https://bulksms.sssplsales.in/api/api_http.php?username=SYNERGIC&password=api@2021&senderid=SYNRGC&to=' + to + '&text=' + text + '&route=Informative&type=text',
            'headers': {
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            resolve(true);
        });
    })
}

const send_email = (amount, biller_name, consumer_no, tnx_id, date, mode) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'synergicbbps@gmail.com',
            pass: 'Signature@123'
        }
    });

    var mailOptions = {
        from: 'synergicbbps@gmail.com',
        to: 'samantasubham9804@gmail.com',
        subject: 'ePoriseva',
        text: `
         Thank you for the bill payment of
         ${amount} against ${biller_name} , Consumer No.
         ${consumer_no} ,Transaction ref ID ${tnx_id} received on
         ${date} vide
         ${mode}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        console.log('Email sent: ' + info.response);
    })
}

const conf_biller = async (req, res, next) => {
    // console.log(req.body);
    var type = req.body.radio;
    var cat_id = type == '1' ? req.body.CatId : '';
    var coverage = type == '1' ? req.body.StName : '';
    var cat_name = type == '1' ? req.body.cat_name : '';
    var data = type == '3' ? req.body.BlrName : (type == '4 ' ? req.body.BlrId : '');
    var biller_data = await get_biller(cat_id, coverage, data, type);
    // console.log(biller_data);
    res.render('pay/conf_biller', { biller_data, cat_name, cat_id, coverage });
}

const get_params = async (req, res, next) => {
    // console.log(req.body);
    const biller_id = req.body.BlrId;
    var type = '4';
    var cat_id = '';
    var coverage = '';
    var biller_data = await get_biller(cat_id, coverage, biller_id, type);
    var accpt_type = JSON.parse(biller_data)[0].BillAcceptanceType[0];
    var biller_params = await params(biller_id, accpt_type);
    // console.log(accpt_type);
    res.render('pay/get_biller', { biller_params, biller_id, cat_id: req.body.cat_id, coverage: req.body.coverage, blr_name: req.body.biller_name, cat_name: req.body.CatId, blr_acpt_type: accpt_type });
    // console.log(await params(biller_id));
}

const prePaid = async (req, res, next) => {
    var BlrId = req.body.BlrId
    console.log(BlrId);
    var coverage = await fetch_plans(BlrId);
    var cat = [],
        val = '',
        preval = '',
        wbCat = [];
    // console.log(coverage);
    var dtls = coverage.filter(e => e.PlanID[0].substring(0, 2) == 'WB')
    for (let cov of dtls) {

        // console.log('COV', cov);
        // break;
        val = cov.CatType[0]
        if (preval != val) {
            if (cat.findIndex(e => e.cat == val) >= 0) {
                // console.log('a', cat.findIndex(e => e.cat == val));
                preval = val
            } else {
                cat.push({ cat: val })
                preval = val
            }
        }
    }
    res.render('pay/prepaid_plans', { cat, dtls })
    // console.log(cat);
    // res.send(dtls);
}

const fetch_bill = async (req, res, next) => {
    // console.log({ fetch_bill: req.body });
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    const agent_ref_id = 'INTB' + ref_id;
    // console.log('INTB' + agent_ref_id);
    const data = JSON.parse(JSON.stringify(req.body));
    var keys = Object.keys(data);
    var values = Object.keys(data).map(key => data[key]);
    var obj = '';
    var prev_val = '';
    var body_str = '';
    for (var i = 2; i < (keys.length - 3); i++) {
        obj = '<' + keys[i] + '>' + values[i] + '</' + keys[i] + '>';
        body_str = prev_val + obj;
        prev_val = body_str;
        // obj[keys[i]] = values[i];
    }
    const mode = await pay_mode(req.body.BlrId);
    // console.log(mode);
    const bill_details = await get_bill(agent_ref_id, body_str);
    // console.log(bill_details);
    res.render('pay/get_bill', { bill_dtls: bill_details.bill_data, ref_id: bill_details.ref_id, mode, blr_name: req.body.blr_name, BlrId: req.body.BlrId, PhNo: req.body.Field1 });
}

const conf_bill = (req, res, next) => {
    const data = req.body;
    // console.log({ conf_bill: data });
    res.render('pay/consf_bill', { data })
}

const conf_quick_pay = async (req, res, next) => {
    const data = JSON.parse(JSON.stringify(req.body));
    const biller_id = req.body.BlrId;
    const accpt_type = req.body.BillAcceptanceType;
    var biller_params = await params(biller_id, accpt_type);
    res.render('pay/conf_quick_pay', { data, biller_params })

    // var values = Object.keys(data).map(key => data[key]);
}

const pay_bill = async (req, res, next) => {
    // console.log({req_body: req.body});
    var type = req.body.BillAcceptanceType;
    var blr_name = type == '1' ? req.body.blr_name : req.body.BillarName;
    const ref_id = await AgentRefNo(111111111111111, 999999999999999);
    const agent_ref_id = 'INTB' + ref_id;
    var req_body = '';
    if (type == '1') {
        const data = JSON.parse(JSON.stringify(req.body));
        var keys = Object.keys(data);
        var values = Object.keys(data).map(key => data[key]);
        var obj = '';
        var prev_val = '';
        var body_str = '';
        for (var i = 2; i < (keys.length - 3); i++) {
            obj = '<' + keys[i] + '>' + values[i] + '</' + keys[i] + '>';
            body_str = prev_val + obj;
            prev_val = body_str;
            // obj[keys[i]] = values[i];
        }
        req_body = '<Payments><Payment><AgntId>' + agntId + '</AgntId><Keyword>' + keyword + '</Keyword><AgntRefId>' + agent_ref_id + '</AgntRefId><DebitAcNo>AIAGTAC001</DebitAcNo><DebitBranch>INDB000018</DebitBranch><PayChannel>AGT</PayChannel><PayMode>Cash</PayMode><SplitAmt>0</SplitAmt><Field16>1234568</Field16><Field17>9450945011</Field17><Field18>12.9580,77.7440</Field18><Field19>400013</Field19>' + body_str + '<CCF>0</CCF><SplitPay>No</SplitPay><TotalAmt>' + req.body.BillAmt + '</TotalAmt><QuickPay>1</QuickPay></Payment></Payments>';
    }
    // console.log(req_body);
    const RefId = String(String(req.body.RefId).replace('"', '')).replace('"', '');
    const pay_details = await bill_pay(agent_ref_id, RefId, req.body.BlrId, req.body.PayMode, req.body.BASE_BILL_AMOUNT, type, req_body);
    // console.log({ code: pay_details.code });
    const pay = pay_details.pay_data;
    var trns_dt = new Date().toLocaleString('en-IN');
    // console.log({ id: pay_details});
    if (pay_details.code == 'SUCX001') {
        await send_text_msg(req.body.PayeePhoneNo, req.body.BASE_BILL_AMOUNT, req.body.BillarName, JSON.parse(pay)[1].Value[0], pay_details.txnref_no, trns_dt, req.body.PayMode);
        await send_email(req.body.BASE_BILL_AMOUNT, req.body.BillarName, JSON.parse(pay)[1].Value[0], pay_details.txnref_no, trns_dt, req.body.PayMode);
    }
    res.render('pay/conf_pay', { pay, blr_name, ref_no: pay_details.txnref_no, msg: pay_details.msg, trns_dt, PayeePhoneNo: req.body.PayeePhoneNo, BlrId: req.body.BlrId, PayMode: req.body.PayMode });
}

// EXPORT MODULES
module.exports = {
    index,
    conf_biller,
    get_params,
    fetch_bill,
    conf_bill,
    conf_quick_pay,
    pay_bill,
    prePaid
}