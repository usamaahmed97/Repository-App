const Sequelize = require("sequelize");
const sequelize = require("../database/connection");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Repository = require("../models/Repository");
const message = require(".././constants");

const renderYourRepositoriesPage = async (req, res) => {
  const id = req.cookies.userData.id;
  const firstName = req.cookies.userData.firstName;

  const yourRepositories = await Repository.findAll(
    { where: { userId: id } },
    { raw: true }
  );
  res.cookie("yourRepositories", yourRepositories);

  res.render("yourRepositories", { yourRepositories, id, firstName });
};

const createRepositoryPage = (req, res) => {
  const firstName = req.cookies.userData.firstName;
  const id = req.cookies.userData.id;
  res.render("createRepository", { firstName, id });
};

const createYourRepository = async (req, res) => {
  let createRepositoryErrors = [];
  const id = req.cookies.userData.id;
  const { repositoryName, repositoryDescription } = req.body;
  if (!repositoryName || !repositoryDescription) {
    createRepositoryErrors.push({ msg: message.fillAllFields });
  }

  if (createRepositoryErrors.length > 0) {
    res.render("createRepository", {
      repositoryName,
      repositoryDescription,
      createRepositoryErrors,
      id,
    });
  } else {
    try {
      const repo = await Repository.create({
        repositoryName: repositoryName,
        repositoryDescription: repositoryDescription,
        userId: id,
      });

      if (repo) {
        console.log("Repository Created");

        // Updating the Repository data in cookies.
        const allRepositories = await Repository.findAll({ raw: true });
        res.cookie("allRepositories", allRepositories);
        res.redirect("/dashboard/" + req.cookies.userData.id);
      } else {
        createRepositoryErrors.push({ msg: message.repositoryError });
        res.render("createRepository", {
          repositoryName,
          repositoryDescription,
          createRepositoryErrors,
          id,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
};

const deleteYourRepositories = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  //Deleting the repository with the ID passed in parameter and refreshing
  //the repository data in cookies.

  try {
    const isDeleted = await Repository.destroy({ where: { id: id } });
    if (isDeleted) {
      console.log("Repo Deleted");

      //Refreshing the data
      const allRepos = await Repository.findAll();
      res.cookie("allRepositories", allRepos);

      const yourRepos = await Repository.findAll({ where: { id: id } });
      res.cookie("yourRepositories", yourRepos);

      res.redirect("/yourRepositories");
    } else {
      console.log("repository cannot be deleted");
    }
  } catch (err) {
    console.log(err);
  }
};

const renderEditRepositoriesPage = async (req, res) => {
  const id = req.params.id;
  const firstName = req.cookies.userData.firstName;
  //Finding the details of the rep based on the ID passed.

  try {
    const editRepository = await Repository.findOne(
      { where: { id: id } },
      { raw: true }
    );
    res.cookie("editRepository", editRepository);

    if (editRepository) {
      res.render("yourRepositoriesEdit", { editRepository, firstName, id });
    } else {
      res.redirect("/yourRepositories");
    }
  } catch (err) {
    console.log(err);
  }
};

const editRepository = async (req, res) => {
  let repositoryErrors = [];

  const { repositoryName, repositoryDescription } = req.body;
  const id = req.cookies.editRepository.id;
  const firstName = req.cookies.editRepository.firstName;

  if (!repositoryName || !repositoryDescription) {
    repositoryErrors.push({ msg: message.fillAllFields });
  }

  if (repositoryErrors.length > 0) {
    res.render("yourRepositoriesEdit", {
      editRepository,
      repositoryErrors,
      firstName,
      id,
    });
  } else {
    try {
      const isUpdated = await Repository.update(
        {
          repositoryName: repositoryName,
          repositoryDescription: repositoryDescription,
        },
        { where: { id: id } }
      );

      if (isUpdated) {
        console.log("Repository Updated");
        res.redirect("/yourRepositories");
      } else {
        const editRepository = await Repository.findOne(
          { where: { id: id } },
          { raw: true }
        );
        res.cookie("editRepository", editRepository);
        repositoryErrors.push({ msg: message.repositoryUpdateError });
        res.render("yourRepositoriesEdit", {
          editRepository,
          repositoryErrors,
          firstName,
          id,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = {
  renderYourRepositoriesPage,
  createRepositoryPage,
  createYourRepository,
  deleteYourRepositories,
  renderEditRepositoriesPage,
  editRepository,
};
