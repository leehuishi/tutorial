import React, { useEffect, useContext } from "react"
import Page from "./Page"
import CreateGroup from "./CreateGroup"
import UserList from "./UserList"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance"
import axios from "axios"
import { Navigate } from "react-router-dom"
import Header from "./Header"

function UserManage(){
    const appDispatch = useContext(DispatchContext)

    const initialState = {
        groups: [],
        isadmin: ""
    }
    
    function ourReducer(draft, action){
        switch (action.type){
            case "retrievegroups":
                if(action.value.length > 0){
                    draft.groups = action.value
                }
                return
            case "addGroup":
                draft.groups.push(action.value);
                return;
            case "checkIsAdmin":
                draft.isadmin = action.value
                return
            default:
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
    
    //=============================================================================
    //get grouplist
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/group/all")

                if(response.data.success){
                    const data = response.data.data
                    dispatch({type: "retrievegroups", value: data})
                }
                
            }
            catch(e){

                //add check status code if it is no access!!!!!!!!!!!!!!!!!!!!!!!!
                appDispatch({ type: "flashMessage", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [])

    //------------------------------------------------------------------------------
    //check if user is admin
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/user/isadmin")

                if(response.data.success){
                    const data = response.data.data
                    if(data.isAdmin && data.isAdmin){
                        dispatch({type: "checkIsAdmin", value: data.isAdmin})
                        console.log(data.isAdmin)
                    }
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessage", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [])

    
    
    //=============================================================================

    return(
        <>
            <Header />
            {state.isadmin == "" ?
                // <Navigate to="/home" />
                <Page title="User Management" wide={true} top={false} tablewide={true}>
                    User you no longer have access. Reach out to your admin for more information.
                </Page>
                : 
                <>
                    {state.isadmin ? 
                        <Page title="User Management" wide={true} top={false} tablewide={true}>
                            <div className="small-text"></div>
                            <CreateGroup  onGroupAdd={(newGroup) => dispatch({ type: "addGroup", value: newGroup })}/>
                            <br/>
                            <UserList groupslist={state.groups}/>
                        </Page>
                    :
                        <Navigate to="/" />
                    }
                </>
            }
        </>
        
    )
}

export default UserManage