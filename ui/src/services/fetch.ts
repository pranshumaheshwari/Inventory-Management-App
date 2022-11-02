const API_URL = 'http://localhost:3000'

export interface FetchInterface {
    url: string,
    options?: {
        method?: "GET" | "POST" | "PUT" | "DELETE",
        body?: { [key: string]: any },
        params?: { [key: string]: any },
        authToken?: string,
        postFetch?: (data: any[]) => any[]
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
    }).then(async res => {
        const data = await res.json()
        if (res.ok) {
            return data
        }
        throw Error(JSON.stringify(data))
    }).then(async data => {
        if(options?.postFetch) {
            return options.postFetch(data)
        }
        return data
    })
    .catch(err => {
        throw Error(err)
    })
    return data
}

export default FetchService
