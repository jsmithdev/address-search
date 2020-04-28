import { LightningElement } from 'lwc';

export default class Demo extends LightningElement {
    console({ detail }){
        console.log(detail)
        console.log(document.querySelector('address-search').value)
        console.log(document.querySelector('c-address-search').value)
    }
    error({ detail }){
        console.error(detail)
    }
}