import React, { useEffect, useContext } from "react"
import Page from "./Page"
import Header from "./Header"


function HomePage(props){
    return (
        <>
            <Header />
            <Page title="Profile" wide={true} top={true}>
                <h1>Welcome Home Page!</h1>
            </Page>
        </>
        
    )
}

export default HomePage