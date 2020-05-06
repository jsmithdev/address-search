import { api, LightningElement, track, wire } from 'lwc'

import getDetails from '@salesforce/apex/Google.addressDetails'

import search from '@salesforce/apex/Google.addressAutoComplete'

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 500;
const MIN_QUERY_LENGTH = 4;

export default class AddressSearch extends LightningElement {

    @api label = ''
    @api placeholder = ''

    @track query = ''

    searchResults = []//formatData(dummy())

    icon = 'standard:address'
    
    handleKeyChange(event) {

        const query = event.target.value

        console.log(`handleKeyChange => ${query}`)

        if(query.length < MIN_QUERY_LENGTH){ return }

        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        if(this.delayTimeout){ window.clearTimeout(this.delayTimeout) }


        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => this.search(query), DELAY)

        return
    }
    
    async search(input){
        console.log('search')
        try {
            
            const result = await search({ input })
            console.log(result)
            
            const data = JSON.parse(result)

            const results = formatData(data)

            console.log(results)

            this.searchResults = results

            this.dispatchEvent(new CustomEvent('searchResults', { detail: this.searchResults }))
        }
        catch (error) {
            console.error(error)
            this.dispatchEvent(new CustomEvent('error', { detail: error }))  
        }
    }

    handleResultClick(event){
        
        const selectedId = event.currentTarget.dataset.id

        this.selected = this.searchResults.find(result => result.id === selectedId)
        this.query = this.selected.full
        //this.value = this.selected.full
        this.searchResults = []

        this.getDetails(this.selected.id)
    }
    handleResultClick(event){
        
        const selectedId = event.currentTarget.dataset.id

        this.selected = this.searchResults.find(result => result.id === selectedId)
        this.query = this.selected.full
        //this.value = formatData(this.selected)
        this.searchResults = []
            
        this.getDetails(this.selected.id)
    }


    
    // todo parse out geo coords
    async getDetails(place_id){
        //console.log('details  '+place_id)
        try {

            if(!this.selected){ return }
            
            const result = await getDetails({ place_id })
            //console.log(JSON.parse(JSON.stringify({'detailResults': result})))
            
            this.selected_detail = JSON.parse(result)
            this.current_street = ''


            this.selected_detail.result.address_components.map(part => {
                if(part.types.includes("street_number")){
                    this.current_street = part.short_name
                }
                if(part.types.includes("route")){
                    this.street = `${this.current_street} ${part.short_name}`
                }
                if(part.types.includes("locality")){
                    this.city = part.short_name
                }
                if(part.types.includes("administrative_area_level_2")){
                    this.selected_county = part.short_name.replace(' County', '')
                    //console.log(this.counties)
                    //console.log(part.short_name.replace(' County', ''))
                    const match = this.counties.find(c => c.value === this.selected_county)
                    if(match){
                        //console.log('we have a county MATCH ', match)
                        this.county = this.selected_county
                    }
                }
                if(part.types.includes("administrative_area_level_1")){
                    this.state = part.short_name
                }
                if(part.types.includes("country")){
                    this.country = part.short_name
                }
                if(part.types.includes("postal_code")){
                    this.zip = part.short_name
                }
            })

            this.dispatchEvent(new CustomEvent('selected', { detail: this.getValues() }))
        }
        catch (error) {
            console.error(error)
        }
    }
}

function formatData(result){
    return result.predictions.map(item => {
        return {
            id: item.id,
            full: item.description,
            street: item.structured_formatting.main_text,
            cityStCnt: item.structured_formatting.secondary_text,
            address: item.terms.map(term => term.value)
        }
    })
}


/* 
function dummy(){
    return {
        "predictions" : [
        {
            "description" : "1507 West 4th Street, Coffeyville, KS, USA",
            "id" : "bf2a0c0386f115ab368c688ca78d65c5f764dd14",
            "matched_substrings" : [
                {
                    "length" : 2,
                    "offset" : 0
                }
            ],
            "place_id" : "ChIJ1dXyB3yEt4cRQSwiCyHb71s",
            "reference" : "ChIJ1dXyB3yEt4cRQSwiCyHb71s",
            "structured_formatting" : {
                "main_text" : "1507 West 4th Street",
                "main_text_matched_substrings" : [
                    {
                    "length" : 2,
                    "offset" : 0
                    }
                ],
                "secondary_text" : "Coffeyville, KS, USA"
            },
            "terms" : [
                {
                    "offset" : 0,
                    "value" : "1507"
                },
                {
                    "offset" : 5,
                    "value" : "West 4th Street"
                },
                {
                    "offset" : 22,
                    "value" : "Coffeyville"
                },
                {
                    "offset" : 35,
                    "value" : "KS"
                },
                {
                    "offset" : 39,
                    "value" : "USA"
                }
            ],
            "types" : [ "street_address", "geocode" ]
        },
        {
            "description" : "1502 South Spruce Street, Coffeyville, KS, USA",
            "id" : "9357331c7632183b6557c495cc71d9a829180dd5",
            "matched_substrings" : [
                {
                    "length" : 2,
                    "offset" : 0
                }
            ],
            "place_id" : "ChIJh9knVvKEt4cRjM1tB26OBMo",
            "reference" : "ChIJh9knVvKEt4cRjM1tB26OBMo",
            "structured_formatting" : {
                "main_text" : "1502 South Spruce Street",
                "main_text_matched_substrings" : [
                    {
                    "length" : 2,
                    "offset" : 0
                    }
                ],
                "secondary_text" : "Coffeyville, KS, USA"
            },
            "terms" : [
                {
                    "offset" : 0,
                    "value" : "1502"
                },
                {
                    "offset" : 5,
                    "value" : "South Spruce Street"
                },
                {
                    "offset" : 26,
                    "value" : "Coffeyville"
                },
                {
                    "offset" : 39,
                    "value" : "KS"
                },
                {
                    "offset" : 43,
                    "value" : "USA"
                }
            ],
            "types" : [ "street_address", "geocode" ]
        },
        {
            "description" : "1503 Columbus Avenue, Coffeyville, KS, USA",
            "id" : "b92acc9be78dd22871c6f566bab7c57a8eee6c1b",
            "matched_substrings" : [
                {
                    "length" : 2,
                    "offset" : 0
                }
            ],
            "place_id" : "ChIJgxmcWAuEt4cRONIUNX409DA",
            "reference" : "ChIJgxmcWAuEt4cRONIUNX409DA",
            "structured_formatting" : {
                "main_text" : "1503 Columbus Avenue",
                "main_text_matched_substrings" : [
                    {
                    "length" : 2,
                    "offset" : 0
                    }
                ],
                "secondary_text" : "Coffeyville, KS, USA"
            },
            "terms" : [
                {
                    "offset" : 0,
                    "value" : "1503"
                },
                {
                    "offset" : 5,
                    "value" : "Columbus Avenue"
                },
                {
                    "offset" : 22,
                    "value" : "Coffeyville"
                },
                {
                    "offset" : 35,
                    "value" : "KS"
                },
                {
                    "offset" : 39,
                    "value" : "USA"
                }
            ],
            "types" : [ "street_address", "geocode" ]
        },
        {
            "description" : "1505 West 2nd Street, Coffeyville, KS, USA",
            "id" : "787025b381c1e5cc1a4106db8c9782a1ab254aa6",
            "matched_substrings" : [
                {
                    "length" : 2,
                    "offset" : 0
                }
            ],
            "place_id" : "ChIJZcw9fXmEt4cRxsYevFcZbFs",
            "reference" : "ChIJZcw9fXmEt4cRxsYevFcZbFs",
            "structured_formatting" : {
                "main_text" : "1505 West 2nd Street",
                "main_text_matched_substrings" : [
                    {
                    "length" : 2,
                    "offset" : 0
                    }
                ],
                "secondary_text" : "Coffeyville, KS, USA"
            },
            "terms" : [
                {
                    "offset" : 0,
                    "value" : "1505"
                },
                {
                    "offset" : 5,
                    "value" : "West 2nd Street"
                },
                {
                    "offset" : 22,
                    "value" : "Coffeyville"
                },
                {
                    "offset" : 35,
                    "value" : "KS"
                },
                {
                    "offset" : 39,
                    "value" : "USA"
                }
            ],
            "types" : [ "street_address", "geocode" ]
        },
        {
            "description" : "1503 West 6th Street, Coffeyville, KS, USA",
            "id" : "4e2ed1e87e9b1abf99b0148d9a7c96e159461ccd",
            "matched_substrings" : [
                {
                    "length" : 2,
                    "offset" : 0
                }
            ],
            "place_id" : "ChIJd5wkLnyEt4cRVmEjVjkGNJY",
            "reference" : "ChIJd5wkLnyEt4cRVmEjVjkGNJY",
            "structured_formatting" : {
                "main_text" : "1503 West 6th Street",
                "main_text_matched_substrings" : [
                    {
                    "length" : 2,
                    "offset" : 0
                    }
                ],
                "secondary_text" : "Coffeyville, KS, USA"
            },
            "terms" : [
                {
                    "offset" : 0,
                    "value" : "1503"
                },
                {
                    "offset" : 5,
                    "value" : "West 6th Street"
                },
                {
                    "offset" : 22,
                    "value" : "Coffeyville"
                },
                {
                    "offset" : 35,
                    "value" : "KS"
                },
                {
                    "offset" : 39,
                    "value" : "USA"
                }
            ],
            "types" : [ "street_address", "geocode" ]
        }
        ],
        "status" : "OK"
    }
} */