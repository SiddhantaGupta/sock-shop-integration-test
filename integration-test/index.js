const axios = require("axios")

const baseUrl = "http://host.docker.internal"

let error = false

async function userLogin() {
    const username = "user"
    const password = "password"

    const base64EncodedBasicToken = Buffer.from(`${username}:${password}`).toString("base64")

    let loginResponse;
    let authToken

    try {
        const loginResponse = await axios.get(`${baseUrl}/login`, {
            headers: {
                Authorization: `Basic ${base64EncodedBasicToken}`
            }
        })

        const cookies = loginResponse.headers["set-cookie"]
        const authTokenCookie = cookies.filter(cookie => cookie.includes("logged_in"))[0]
        authToken = authTokenCookie.substring(
            authTokenCookie.indexOf("=") + 1, 
            authTokenCookie.indexOf(";")
        );

    } catch(err) {
        throw new Error("login test failed")
    }

    return authToken
    
}

async function getAddresses(authToken) {
    try {
        const response = await axios.get(`${baseUrl}/addresses`, {
            headers: {
                Authorization: `Basic ${authToken}`
            }
        })

        if (!response.data._embedded.address) {
            throw new Error()
        }
    } catch(err) {
        throw new Error("Address test failed")
    }
    
}


async function addressIntegrationTest() {
    try {
        const authToken = await userLogin()
        await getAddresses(authToken)
    } catch(err) {
        console.log("Address integration test failed")
        error = true
        return
    }

    console.log("Address integration test successful")
}

async function getCatalogue(authToken) {
    try {
        const response = await axios.get(`${baseUrl}/catalogue`, {
            headers: {
                Authorization: `Basic ${authToken}`
            }
        })

        if (!response.data) {
            throw new Error()
        }

        return response.data

    } catch(err) {
        throw new Error("Address test failed")
    }
}

async function catalogueIntegrationTest() {
    try {
        const authToken = await userLogin()
        const catalogue = await getCatalogue(authToken)
    } catch(err) {
        console.log("Catalogue integration test failed")
        error = true
        return
    }

    console.log("Catalogue integration test successful")

}


setTimeout(async () => {
    await addressIntegrationTest()
    await catalogueIntegrationTest()
    if (error) {
        throw new Error("Some Tests failed")
    }
}, 30 * 1000)