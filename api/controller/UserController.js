const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

module.exports = {
  signIn: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          password: true,
          level: true,
        },
        where: {
          username,
          status: "use",
        },
      });

      if (user != null) {
        const MatchingPassword = await bcrypt.compare(password, user.password);

        if (!MatchingPassword) {
          return res.status(401).send({ error: "unauthorized" });
        }

        const key = process.env.SECRET_KEY;
        const token = jwt.sign(user, key, { expiresIn: "1d" });

        return res.send({ token: token, name: user.name, id: user.id });
      } else {
        return res.status(401).send({ error: "unauthorized" });
      }
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  list: async (req, res) => {
    try {
      const results = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          level: true,
        },
        where: {
          status: "use",
        },
      });

      return res.send({ results: results });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  create: async (req, res) => {
    try {
      const { name, username, password, level, permission } = req.body;

      if (permission !== process.env.PERMISSION_KEY) {
        return res.status(401).send({ error: "Access denied" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.findFirst({
        where: {
          username,
        },
      });

      if (user) {
        return res
          .status(409)
          .send({ message: "fail", status: "Username already exists" });
      }

      await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          level: level.toUpperCase(),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  update: async (req, res) => {
    try {
      const { name, username, password, level, permission } = req.body;

      if (permission !== process.env.PERMISSION_KEY) {
        return res.status(401).send({ error: "Access denied" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        data: {
          name,
          username,
          password: hashedPassword,
          level: level.toUpperCase(),
        },
        where: {
          id: parseInt(req.params.id),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  remove: async (req, res) => {
    try {
      const { id, permission } = req.body;

      if (permission !== process.env.PERMISSION_KEY) {
        return res.status(401).send({ error: "Access denied" });
      }
      await prisma.user.update({
        data: {
          status: "delete",
        },
        where: {
          id: parseInt(id),
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
  getLevelFromToken: async (req, res) => {
    try {
      const authHeader = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(authHeader, process.env.SECRET_KEY);
      const level = decode.level;

      return res.send({ level: level });
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  },
};
