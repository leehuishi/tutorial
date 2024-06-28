import React, { useContext } from "react"
import {Link} from "react-router-dom"
import StateContext from "../StateContext"
import { removeAuthTokenCookie } from "../RemoveCookieUtils"
import DispatchContext from "../DispatchContext"
import NavBar from './NavBar'


function Header(props){
    const appDispatch = useContext(DispatchContext)

    async function handleLogout(){
        try{
            removeAuthTokenCookie()
            appDispatch({type: "logout"})
            appDispatch({ type: "flashMessage", value: "Logout Successful"})
        }
        catch(e){
            console.log("Logout unsuccessful")
        }
    }

    const appState = useContext(StateContext)
    
    return (
        <>
            <header className="header-bar">
                <div className="container d-flex flex-column flex-md-row align-items-center p-3">
                    <h4 className="my-0 mr-md-auto font-weight-normal">
                        <Link to="/" className="text-white">
                            Task Management System
                        </Link>
                    </h4>

                    <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                        Sign Out
                    </button>
                </div>
            </header>
            <hr style={{ margin: '0' }} /> {/* White line */}
            <NavBar />
        </>
    )
}

export default Header