exports.getPost = (req, res) => {
  res.json({
    posts: [
      { title: "SocNet in development!" },
      { title: "Developers of SocNet are in crisis!" },
    ],
  });
};
