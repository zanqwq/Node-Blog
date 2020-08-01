const routeConfigs = [
  require('./signin'),
  require('./signup'),
  require('./signout'),
  require('./posts'),
  require('./comments')
]

module.exports = function setupRoutes (app) {
  app.get('/', (req, res) => {
    res.redirect('/posts')
  })

  routeConfigs.forEach(routeConfig => {
    app.use(routeConfig.path, routeConfig.router)
  })
}
