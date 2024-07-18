const useState = React.useState
const useEffect = React.useEffect


function OurApp() {
  const [pets, setPets] = useState([])
  
  //only run once the first time this component is rendered
  //useEffect(a, b) 
  //a is the function you will like to run
  //b is the dependencies you want to watch for changes
  useEffect(() => {
    if(localStorage.getItem("examplePetData")){
      setPets(JSON.parse(localStorage.getItem("examplePetData")))
    }
  }, [])
  
  //run everytime out pet state changes
  //local storage only store string data
  useEffect(()=>{
    localStorage.setItem("examplePetData", JSON.stringify(pets))
  }, [pets])
  
  return (
    <>
      <OurHeader />
      <LikeArea />
      <TimeArea />
      <AddPetForm setPets={setPets}/>
      <ul>
          {pets.map(pet => {
            return <Pet setPets={setPets} id={pet.id} name={pet.name} species={pet.species} age={pet.age} key={pet.id}/>
          })}
      </ul>
      <Footer />
    </>
  )
}


function AddPetForm(props) {
  const [name, setName] = useState()
  const [species, setSpecies] = useState()
  const [age, setAge] = useState()
  
  function handleSubmit(e){
      e.preventDefault();
      props.setPets(prev => {
        return prev.concat({name: name, species: species, age: age, id: Date.now()})
      })
      setName("")
      setSpecies("")
      setAge("")
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Add New Pet</legend>
        <input value={name} onChange={e=> setName(e.target.value)} placeholder="Name" />
        <input value={species} onChange={e=> setSpecies(e.target.value)} placeholder="species" />
        <input value={age} onChange={e=> setAge(e.target.value)} placeholder="age in years" />
        <button>Add Pet</button>
      </fieldset>
    </form>
  )
}

function LikeArea(){
  const [likeCount, setLikeCount] = useState(0)
  
  function increaseLike(){
    setLikeCount(function(prev) {
      return prev + 1
    })
  }
  
  function decreaseLike(){
    setLikeCount(prev =>  {
      if(prev > 0){
        return prev - 1
      }
      return 0
    })
  }
  
  return (
    <>
      <button onClick={ increaseLike }>Increase Like</button>
      <button onClick={ decreaseLike }>Decrease Like</button>
      <h2>This page has been liked { likeCount } times</h2>
    </>
  )
}

function Pet(props){
  function handleDelete(){
    props.setPets(prev =>prev.filter(pet => pet.id != props.id))
  }
  
  return (
    <>
      <li>{props.name} is a {props.species} and is {props.age} years old.</li>
      <button onClick={handleDelete}>Delete</button>
     </>
  )
}

function Footer(){
  return <small>Copyright Footer Text</small>
}
function TimeArea(){
  const [theTime, setTheTime] = useState(new Date().toLocaleString())
  
  useEffect(()=>{
    const interval = setInterval(() => setTheTime(new Date().toLocaleString()), 1000)
    
    return () => clearInterval(interval) //what ever is return serve as a clean up
  }, [])
  
  return <p>The current time is {theTime}.</p>
}

function OurHeader(){
  return  <h1 className="special">Our Amazing App Header</h1>
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<OurApp />)
