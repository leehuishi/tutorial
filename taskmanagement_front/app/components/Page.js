import React, { useEffect } from "react"
import Container from './Container'

function Page(props){
    useEffect(()=>{
        document.title = `${props.title} | Task Mgmt`
        window.scrollTo(0, 0)
    }, [props.title])
    
    return (
        <Container wide={props.wide} top={props.top} tablewide={props.tablewide}>
            {props.children}
        </Container>
    )
}

export default Page