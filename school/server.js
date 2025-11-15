const express = require("express");
const fs = require("fs");
const https = require("https");
const http = require("http");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const uri = "mongodb+srv://swizzcodes929:KEbltwiStrEZVPFG@khschools.vzxrubo.mongodb.net/";
const dbName = "kh_schools";
const client = new MongoClient(uri);

let db, adminsCollection, khBoysCollection, khGirlsCollection;

async function initDB() {
    await client.connect();
    db = client.db(dbName);
    adminsCollection = db.collection("admins_data");
    khBoysCollection = db.collection("kh_boys");
    khGirlsCollection = db.collection("kh_girls");
}

app.get("/loginAdmin", async (req, res) => {
    const adminId = req.query.admin_id?.toUpperCase();
    const adminPassword = req.query.admin_password;

    if (!adminId || !adminPassword) {
        return res.status(400).json({ error: "admin_id and admin_password are required" });
    }

    try {
        const admin = await adminsCollection.findOne({ admin_id: adminId });
        if (admin && adminPassword === admin.admin_password) {
            res.json({ login_attempt: "success", admin_id: adminId });
        } else {
            res.json({ login_attempt: "failed" });
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
});

app.get("/login_admin_now", async (req, res) => {
    const adminId = req.query.admin_id?.toUpperCase();
    if (!adminId) {
        return res.status(400).json({ error: "admin_id is required" });
    }

    try {
        const admin = await adminsCollection.findOne({ admin_id: adminId });
        if (admin) {
            res.json(admin);
        } else {
            res.json({ login_attempt: "failed" });
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
});

app.get("/get_school_data", async (req, res) => {
    const school = req.query.school_id;

    if (!school) {
        return res.status(404).json({ error: "school_id is required" });
    }

    try {
        if (school === "KHGIRLS") {
            const girlsData = await khGirlsCollection.findOne({ school_id: "KHGIRLS" });
            if (girlsData) res.json(girlsData);
        } else if (school === "KHBOYS") {
            const boysData = await khBoysCollection.findOne({ school_id: "KHBOYS" });
            if (boysData) res.json(boysData);
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
});

app.get("/update_boys_notice", async (req, res) => {
    const index = parseInt(req.query.index);
    const noticeStatus = req.query.notice_status === "true";
    const SCHOOLID = req.query.school_id;

    if (isNaN(index) || !SCHOOLID) {
        return res.status(400).json({ success: false, error: "Invalid input" });
    }

    try {
        let collection = SCHOOLID === "KHBOYS" ? khBoysCollection :
            SCHOOLID === "KHGIRLS" ? khGirlsCollection : null;

        if (!collection) return res.status(400).json({ success: false, error: "Invalid school_id" });

        const result = await collection.updateOne(
            { school_id: SCHOOLID },
            { $set: { [`school_circulars.${index}.notice_status`]: noticeStatus } }
        );

        res.json({ success: true, result });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

app.delete("/delete_notice", async (req, res) => {
    const index = parseInt(req.query.index);
    const schoolId = req.query.school_id;

    if (isNaN(index) || !schoolId) {
        return res.status(400).json({ success: false, error: "Invalid index or school_id" });
    }

    try {
        let collection = schoolId === "KHBOYS" ? khBoysCollection :
            schoolId === "KHGIRLS" ? khGirlsCollection : null;

        if (!collection) return res.status(404).json({ success: false, error: "School not found" });

        const schoolDoc = await collection.findOne({ school_id: schoolId });
        if (!schoolDoc) return res.status(404).json({ success: false, error: "School not found" });

        const result = await collection.updateOne(
            { school_id: schoolId },
            { $unset: { [`school_circulars.${index}`]: 1 } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, error: "Notice not found or not deleted" });
        }

        await collection.updateOne(
            { school_id: schoolId },
            { $pull: { school_circulars: null } }
        );

        res.json({ success: true, message: "Notice deleted" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

app.post("/add_notice", async (req, res) => {
    const schoolId = req.query.school_id;
    const newNotice = req.body;

    if (!schoolId || !newNotice) {
        return res.status(400).json({ success: false, message: "Missing school_id or notice body" });
    }

    try {
        let collection = schoolId === "KHBOYS" ? khBoysCollection :
            schoolId === "KHGIRLS" ? khGirlsCollection : null;

        if (!collection) return res.status(400).json({ success: false, message: "Invalid school_id" });

        const schoolDoc = await collection.findOne({ school_id: schoolId });

        if (!schoolDoc) {
            await collection.insertOne({
                school_id: schoolId,
                school_circulars: [newNotice]
            });
        } else {
            await collection.updateOne(
                { school_id: schoolId },
                { $push: { school_circulars: newNotice } }
            );
        }

        res.json({ success: true, message: "Notice added successfully" });
    } catch (error) {
        console.error("Add notice error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

const sslOptions = {
    key: fs.readFileSync("C:/Users/Khuth/certs/privkey.pem"),
    cert: fs.readFileSync("C:/Users/Khuth/certs/fullchain.pem")
};

initDB().then(() => {
    https.createServer(sslOptions, app).listen(8787, () => {
        console.log("? HTTPS server running on port 8787");
    });

    http.createServer((req, res) => {
        res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
        res.end();
    }).listen(80, () => {
        console.log("?? HTTP server redirecting to HTTPS");
    });
}).catch(err => {
    console.error("? Failed to connect to MongoDB:", err);
});
