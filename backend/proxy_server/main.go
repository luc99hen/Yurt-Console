package main

import (
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"

	"github.com/gin-contrib/cors"
)

func main() {
	// Set the router as the default one shipped with Gin
	router := gin.Default()
	router.Use(cors.Default())

	// Serve frontend static files
	router.Use(static.Serve("/", static.LocalFile("../../frontend/build", true)))
	// if no match route found, take it to index.html for front-end routing
	router.NoRoute(func(c *gin.Context) { c.File("../../frontend/build/index.html") })
	// setup route group for the API
	setAPIGroup(router)

	// Start and run the server
	if err := router.Run(":8001"); err != nil {
		panic("gin server fail to start")
	}
}

func setAPIGroup(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.POST("/getOverview", getClusterOverviewHandler)
		api.POST("/getNodes", getNodeHandler)
		api.POST("/getDeployments", getDeploymentHandler)
		api.POST("/getStatefulsets", getStatefulsetHandler)
		api.POST("/getJobs", getJobHandler)
		api.POST("/getNodepools", getNodepoolHandler)
		api.POST("/getPods", getPodHandler)
		api.POST("/login", loginHandler)
		api.POST("/register", registerHandler)
		api.POST("/setNodeAutonomy", setNodeAutonomyHandler)
	}
}
