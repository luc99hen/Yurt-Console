package main

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func parseResourceParas(c *gin.Context) (kubeConfig, namespace string, err error) {
	requestParas := &User{}

	// request body format not allowed
	if err := c.BindJSON(requestParas); err != nil {
		return "", "", fmt.Errorf("parse Paras Error")
	}

	return requestParas.KubeConfig, requestParas.Namespace, nil
}

type K8sRequest func(string, string) ([]byte, error)

// use original k8s request results to construct HTTP resp
func proxyRequest(c *gin.Context, fn K8sRequest) {

	kubeConfig, namespace, err := parseResourceParas(c)
	if err != nil {
		JSONErr(c, http.StatusBadRequest, err.Error())
	}

	// use k8s apiserver's raw resp body as proxy server resp body
	resBody, err := fn(kubeConfig, namespace)
	if err != nil {
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	// assert content-type is "application/json" for client requst
	c.DataFromReader(http.StatusOK, int64(len(resBody)), "application/json", bytes.NewReader(resBody), nil)
}

func JSONErr(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{
		"msg":    msg,
		"status": false,
	})
}
