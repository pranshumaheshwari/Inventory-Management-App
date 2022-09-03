const API_URL = 'http://localhost:3000'

export interface FetchInterface {
    url: string,
    options?: {
        method?: "GET" | "POST" | "PUT" | "DELETE",
        body?: { [key: string]: any },
        params?: { [key: string]: any },
        authToken?: string
    }
}

const FetchService = async ({ url, options }: FetchInterface) => {
    let headers: HeadersInit = {
        'Content-Type': 'application/json',
    }
    if (options?.authToken) {
        headers['Authorization'] = 'Bearer ' + options.authToken
    }
    const data = await fetch(API_URL + url + (options?.params ? "?" + new URLSearchParams(options?.params) : ''), {
        method: options ? options.method : "GET",
        headers,
        body: JSON.stringify(options?.body),
    }).then(res => {
        if (res.ok) {
            return res.json()
        }
        throw Error('Error while doing fetch')
    })
    .catch(err => {
        throw Error(err)
    })
    return data
}

export default FetchService
