import React, { useState, useReducer, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from "./utils/ProtectedRoute"
import Cookies from "js-cookie"

import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

//My Componenets
import Header from './components/Header'
import Profile from "./components/Profile"
import UserManage from "./components/UserManage"
import HomePage from './components/HomePage'
import InApplication from './components/InApplication'
import LoginPage from './components/LoginPage'
import FlashMessages from "./components/FlashMessages"
import FlashMessagesError from "./components/FlashMessagesError"
import NotFound from "./components/NotFound"


function Main() {

    const jwtToken = Cookies.get('jwtToken');
    
    const initialState ={
        loggedIn: jwtToken,
        flashMessages: [],
        flashMessagesError: []
    }


    //Use Immer so that even if there are many state it can still be neat
    function ourReducer(draft, action){
        switch (action.type){
            case "login":
                draft.loggedIn = true
                return
            case "logout":
                draft.loggedIn = false
                return
            case "flashMessage":
                draft.flashMessages.push(action.value)
                return
            case "flashMessageError":
                draft.flashMessagesError.push(action.value)
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)


    return(
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>
                    <FlashMessages messages={state.flashMessages} />
                    <FlashMessagesError messages={state.flashMessagesError} />

                    <Routes>
                        <Route path="/" element={<LoginPage />} />

                        <Route element={<ProtectedRoute isAuthenticated={state.loggedIn} />}>
                            <Route element={<HomePage />} path="/home" exact />
                        </Route>

                        <Route element={<ProtectedRoute isAuthenticated={state.loggedIn} />}>
                            <Route element={<><Profile /></>} path="/profile" exact />
                        </Route>

                        <Route element={<ProtectedRoute isAuthenticated={state.loggedIn} />}>
                            <Route element={<><UserManage /></>} path="/usermanage" exact />
                        </Route>

                        <Route element={<ProtectedRoute isAuthenticated={state.loggedIn} />}>
                            <Route element={<><InApplication /></>} path="/app/:appid" exact />
                        </Route>

                        <Route element={<ProtectedRoute isAuthenticated={state.loggedIn} />}>
                            <Route element={<><InAppPlan /></>} path="/plans/:appid" exact />
                        </Route>

                        <Route path="*" element={<><Header /><NotFound /></>} />
                    </Routes>

                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

//set up to load javascript on the fly asynchronously
if(module.hot){
    module.hot.accept()
}
