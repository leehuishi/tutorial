import React, { useRef, useEffect, useContext } from 'react';
import { useImmerReducer } from 'use-immer'
import axios from "axios"
import Axiosinstance from "../../AxiosInstance"
import DispatchContext from "../DispatchContext"
import { CSSTransition } from "react-transition-group";
import { useNavigate, Link } from "react-router-dom"

const NotesArea = ({ notes, taskid, taskstate, onEditNotes }) => {
    const appDispatch = useContext(DispatchContext)
    const navigate = useNavigate();

    const initialState = {
        dispnotes: "",
        noteinput: {
            value: "",
            hasErrors: false,
            message: "",
        },
        
        submitCount: 0
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "noteinputImmediately":
                draft.noteinput.hasErrors = false
                draft.noteinput.value = action.value
                return
            case "noteinputAfterDelay":
                if(draft.noteinput.value.length < 1){
                    draft.noteinput.hasErrors = true
                    draft.noteinput.message = "Input is required"
                }
                return
            case "submitForm":
                if(!draft.noteinput.hasErrors){
                    draft.submitCount++
                }
                else{
                    appDispatch({ type: "flashMessageError", value: "Invalid inputs"})
                }
                return
            case "resetValue":
                draft.noteinput.value="";
                return
            case "resetDisplay":
                draft.dispnotes = action.value;
                return
            default:
                return
        }
    }

    const [state, dispatch] = useImmerReducer(ourReducer, initialState)


    //=============================================================================
    //delay check
    //=============================================================================
    //delay check for appname (to make sure user finish typing)
    useEffect(() => {
        if(state.noteinput.value){
            const delay = setTimeout(() => dispatch({type: "noteinputAfterDelay"}), 800)
            return () => clearTimeout(delay)
        }
    }, [state.noteinput.value])
    
    //=============================================================================
    //=============================================================================

    //=============================================================================
    //submit add notes
    //=============================================================================
    useEffect(() => {
        if(state.submitCount){
            //incase cancel
            const ourRequest = axios.CancelToken.source()

            async function fetchResults(){
                try{
                    const bodydata = {
                        "notes": state.noteinput.value,
                        "state": taskstate
                    }
                    
                    const url = '/task/addnotes/' + taskid

                    //submit request 
                    const response = await Axiosinstance.put(url, bodydata) //update notes
                    console.log("Add note successfully.")

                    appDispatch({ type: "flashMessage", value: "Task note updated successfully"})

                    const newnote = response.data.data;
                    const newowner = response.data.newowner;

                    onEditNotes(newowner);
                    dispatch({type: "resetDisplay", value: newnote})
                    dispatch({type: "resetValue"})
                }
                catch(e){
                    if(e.response.status === 403){
                        appDispatch({ type: "flashMessageError", value: "Update not successful. Update in access rights."})
                        navigate('/home');
                    }
                    else{
                        console.log("There was a problem or the request was cancelled")
                        appDispatch({ type: "flashMessageError", value: "We are currently having some technical issue. Please try again later."})
                    }
                }

            }
            fetchResults()
            return () => ourRequest.cancel()
        }
    }, [state.submitCount])
    
   
    //=============================================================================
    //=============================================================================


    
    //=============================================================================
    async function handleSubmit(e){
        e.preventDefault()
        dispatch({type: "noteinputImmediately", value: state.noteinput.value})
        dispatch({type: "submitForm"})
    }

    //=============================================================================

    return (
        <>
            <div id="container">
                <pre>{state.dispnotes === ""  ? (notes) : (state.dispnotes)}</pre>
            </div>

            <div id="container2">
                <form onSubmit={handleSubmit} style={{marginRight: "10px"}}>
                    <div className="form-group row" style={{marginRight:"10px"}}>
                        <div className="col-sm-7">
                            <textarea onChange={e => dispatch({type: "noteinputImmediately", value: e.target.value})} value={state.noteinput.value} id="noteinput_create" name="noteinput" className="form-control" autoComplete="off" rows="2">Enter your note.</textarea>
                            <CSSTransition style={{marginTop: "10px"}} in={state.noteinput.hasErrors} timeout={330} classNames="alert" unmountOnExit>
                                <div className="alert alert-danger small">{state.noteinput.message}</div>
                            </CSSTransition>
                        </div>

                        <button type="submit" className="btn btn-success">Submit</button>
                    </div>
                </form>
            </div>
            
        </>
        
    );
};

export default NotesArea;