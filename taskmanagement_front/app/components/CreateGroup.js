import React, { useEffect, useContext } from "react"
import Page from "./Page"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from 'use-immer'
import Axiosinstance from "../../AxiosInstance";
import Axios from 'axios'
import { CSSTransition } from 'react-transition-group';


function CreateGroup({ onGroupAdd }){
    const appDispatch = useContext(DispatchContext)

    const initialState = {
        groupname: {
            value: "",
            hasErrors: false,
            message: "",
            isUnique: false,
            checkCount: 0
        },
        submitGroupNameCount: 0,
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "groupnameImmediately":
                draft.groupname.hasErrors = false
                draft.groupname.value = action.value

                if(draft.groupname.value.length > 32){
                    draft.groupname.hasErrors = true
                    draft.groupname.message = "Group name cannot exceed 32 characters."
                }
                if(draft.groupname.value && !/^[a-zA-Z0-9_]+$/.test(draft.groupname.value)){
                    draft.groupname.hasErrors = true
                    draft.groupname.message = "Group name can only alphanumeric and underscore"
                }
                return
            case "groupnameAfterDelay":
                if(draft.groupname.value.length < 4){
                    draft.groupname.hasErrors = true
                    draft.groupname.message = "Group name must be at least 4 characters."
                }

                if(!draft.groupname.hasErrors && !action.noRequest){
                    //no error
                    draft.groupname.checkCount++
                }
                return
            case "groupnameUniqueResult":
                if(action.value){
                    draft.groupname.hasErrors = true
                    draft.groupname.isUnique = false
                    draft.groupname.message = "That group name is already taken"
                }
                else{
                    draft.groupname.isUnique = true
                }
                return
            case "submitCreateGroup":
                if(!draft.groupname.hasErrors && draft.groupname.isUnique){
                    draft.submitGroupNameCount++
                }
                return
            case "resetGroupname":
                draft.groupname.value = ""
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)
    

    //=============================================================================
    //delay check for groupname (to make sure user finish typing)
    useEffect(() => {
        if(state.groupname.value){
            const delay = setTimeout(() => dispatch({type: "groupnameAfterDelay"}), 100)
            return () => clearTimeout(delay)
        }
    }, [state.groupname.value])

    //=============================================================================


    //=============================================================================
    //check if groupname exist
    useEffect(() => {
        if(state.groupname.checkCount){
            async function fetchResults(){
                try{
                    const url = "/group/check/" + state.groupname.value
                    const response = await Axiosinstance.get(url)
                    
                    if(response.data.success){
                        const data = response.data.data
                        dispatch({type: "groupnameUniqueResult", value: data.groupexist})
                    }
                }
                catch(e){
                    console.log("There was a problem or the request was cancelled")
                    appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                }

            }
            fetchResults()
        }
    }, [state.groupname.checkCount])

    //-----------------------------------------------
    //submit CREATE GROUP
    useEffect(() => {
        if(state.submitGroupNameCount){
            //incase cancel
            const ourRequest = Axios.CancelToken.source()

            async function fetchResults(){
                try{
                    //submit request 
                    await Axiosinstance.post('/group/new', {groupname: state.groupname.value}) //create new group
                    console.log("Group was successfully created.")
                    appDispatch({type: "flashMessage", value: "Group created successfully"})
                    onGroupAdd(state.groupname.value);
                    dispatch({type: "resetGroupname"})
                    
                }
                catch(e){
                    console.log("There was a problem " + e)
                }

            }
            fetchResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitGroupNameCount])


    //=============================================================================
    async function handleSubmit(e){
        e.preventDefault()
        dispatch({type: "groupnameImmediately", value: state.groupname.value})
        dispatch({type: "groupnameAfterDelay", value: state.groupname.value, noRequest: true})

        dispatch({type: "submitCreateGroup"})
        if(state.groupname.hasErrors && !state.groupname.isUnique){
            appDispatch({type: "flashMessageError", value: "Invalid group name"})
            dispatch({type: "resetGroupname"})
        }
    }

   
    //=============================================================================

    return(
        <Page title="User Management" wide={true} top={false}>
            <div>
                <form onSubmit={handleSubmit}>
                    <div style={{paddingTop: '20px'}} className="form-group">
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{paddingTop: '25px', paddingRight: '10px'}}><label htmlFor="groupname-create">Create Group:</label></td>
                                    <td style={{paddingTop: '25px', paddingRight: '10px'}}>
                                        <input onChange={e => dispatch({type: "groupnameImmediately", value: e.target.value})} value={state.groupname.value} id="groupname-create" name="groupname" className="form-control" type="text" autoComplete="off" />
                                        <CSSTransition in={state.groupname.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                                            <div className="alert alert-danger small liveValidateMessage">{state.groupname.message}</div>
                                        </CSSTransition>
                                    </td>
                                    <td style={{paddingTop: '25px'}}>
                                        <button type="submit" className="btn btn-success">Submit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>
        </Page>
    )
}

export default CreateGroup