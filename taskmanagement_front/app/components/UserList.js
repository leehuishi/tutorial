import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance";
import Page from "./Page";
import CreateUser from "./CreateUser";
import EachUser from "./EachUser";

function UserList({ groupslist }){
    const appDispatch = useContext(DispatchContext)

    const initialState = {
        users : []
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "retrieveusers":
                if(action.value.length > 0){
                    draft.users = action.value
                }
                return
            case "addUser":
                draft.users.push(action.value);
                return;
            default:
                return;
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
    
    //=============================================================================
    //get user profile
    useEffect(() => {
        async function fetchData() {
            try{
                const response = await Axiosinstance.get("/user/all")

                if(response.data.success){
                    const data = response.data.data
                    dispatch({type: "retrieveusers", value: data})
                }
                
            }
            catch(e){
                appDispatch({ type: "flashMessage", value: "We are currently having some technical issue. Please try again later."})
            }
        }
        fetchData()
    }, [])
    
    //=============================================================================
   
    //=============================================================================

    return(
        <table className="table table-hover table-bordered">
            <thead>
                <tr>
                    <th style={{ width: "20%" }}>Username</th>
                    <th style={{ width: "20%" }}>Email</th>
                    <th style={{ width: "15%" }}>Password</th>
                    <th style={{ width: "5%" }}>Enabled</th>
                    <th style={{ width: "20%" }}>Group</th>
                    <th style={{ width: "20%" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                <CreateUser onUserAdd={(newUser) => dispatch({ type: "addUser", value: newUser })} groupslist={groupslist} />
                {state.users.map((user, index) => (
                    <EachUser user={user} key={user.username} groupslist={groupslist}/>
                ))}
            </tbody>
        </table>
    )
}

export default UserList