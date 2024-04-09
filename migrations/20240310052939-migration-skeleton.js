module.exports = {

  up: (queryInterface, Sequelize) => {

      return queryInterface.bulkInsert("Users", {
          username: "yeuemvai",
          password: "$2b$10$tMOKTdpqWLu/70TTjDEoFuGnN9urbUhdo.x.p8LGTVolkEovT9cYa",
          email: "manh@gmail.com",
          nickname: "yeuemvai",
          gender: "Nam",
          avatar: "https://bsnl.ch/wp-content/uploads/2019/03/avatar-default-circle.png",
          smallAvatar: "https://bsnl.ch/wp-content/uploads/2019/03/avatar-default-circle.png",
          confirm: 0,
          isActive: 1,
          background: "https://firebasestorage.googleapis.com/v0/b/my-social-network-815dc.appspot.com/o/posts%2F190057688_349127073238727_3602714994290916530_n.jpg_2024-2-16%2018%3A1%3A32_50271d1e-254e-404e-982e-aee86f243293?alt=media&token=bdca74f4-4c2a-4e83-aac7-625d64dffd27",
          backgroundColor: "black",
          address: "",
          story: "",
          workAt: "",
          studyAt: "",
          favorites: "",
          birthday: "",
      }, {});
  },
  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Users', null, {});
  }

}