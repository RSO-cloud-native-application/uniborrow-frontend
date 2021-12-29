import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import {Routes, Route, Navigate, useNavigate, NavLink, useParams} from "react-router-dom";
import DateTimePicker from 'react-datetime-picker';

const LOANS_API = 'http://35.223.79.242/uniborrow-loans/v1/loans'
const USERS_API = 'http://35.223.79.242/uniborrow-users/v1/users'
const ITEMS_API = 'http://35.223.79.242/uniborrow-items/v1/items'

function LoginForm(props) {
    const [userInput, setUserInput] = useState("")

    function submit() {
        props.onSubmit(userInput)
    }

    return <div><input type="text" value={userInput} onChange={e => setUserInput(e.target.value)}/>
        <div onClick={() => submit()}>Submit</div>
    </div>

}

function Item(props) {
    const item = props.item
    return <div className="item">
        <div>{item.title}</div>
        <div className="image-wrapper"><img src={item.uri}/></div>
        <div>{item.description}</div>
        <div>{item.status}</div>
        <div onClick={() => props.onBorrow()}>Borrow</div>
    </div>
}

function ItemList(props) {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    useEffect(() => {
        axios.get(ITEMS_API).then(response => setItems(response.data))
    }, [])

    function onBorrow(item) {
        props.onBorrow(item)
        navigate("" + item.itemId)
    }

    return <div className="item-list">
        {items.map(item => <Item onBorrow={() => onBorrow(item)} item={item}/>)}
        <div onClick={() => navigate("/items/new")}>Add Item</div>
    </div>
}


function ItemBorrowForm(props) {
    const navigate = useNavigate();
    const {itemId} = useParams()
    const [item, setItem] = useState({})
    const [fromDate, setFromDate] = useState(new Date())
    const [toDate, setToDate] = useState(new Date())
    const [description, setDescription] = useState("")

    useEffect(() => {
        axios.get(ITEMS_API + "/" + itemId).then(res => setItem(res.data)).catch(e => alert(e.toString()))
    }, [])

    return <div className="item-borrow-form">
        <div> Description <input onChange={e => setDescription(e.target.value)} value={description} type="text"/></div>
        <div>From <DateTimePicker onChange={setFromDate} value={fromDate}/></div>
        <div>To <DateTimePicker onChange={setToDate} value={toDate}/></div>
        <div onClick={() => props.submitLoanProposal(fromDate, toDate, description, item)}>Submit</div>
        <BackButton/>
    </div>
}

function NavBar() {
    return <div className="nav-bar">
        <NavLink to="/items">Items</NavLink>
        <NavLink to="/loans">My Loans</NavLink>
        <NavLink to="/profile">Profile</NavLink>
    </div>
}

function LoanPreview(props) {
    const loan = props.loan
    const navigate = useNavigate()
    return <div onClick={() => navigate("/loans/" + props.loan.id)} className="loan">
        <div>{loan.itemId}</div>
        <div>{loan.description}</div>
        <div>{loan.startTime.substr(0, 10)} - {loan.endTime.substr(0, 10)}</div>
        <div>{loan.acceptedState}</div>
    </div>
}

function BackButton() {
    const navigate = useNavigate()

    return <div onClick={() => navigate(-1)}>Back</div>
}

function Loan(props) {
    const {loanId} = useParams()
    const [loan, setLoan] = useState({})
    const [item, setItem] = useState({})
    const navigate = useNavigate()
    useEffect(() => {
        axios.get(LOANS_API + "/" + loanId).then(res => {
            axios.get(ITEMS_API + "/" + res.data.itemId).then(res => setItem(res.data))
            setLoan(res.data)
        })
    }, [])

    function acceptLoan() {
        axios.post(LOANS_API + "/" + loanId + "/" + "accept").then(e => navigate("/loans"))
    }

    function proposeNew() {

    }

    return <div>
        <div>
            Loan Info
            <div>{loan.itemId}</div>
            <div>{loan.description}</div>
            <div>{loan.startTime && loan.startTime.substr(0, 10)} - {loan.endTime && loan.endTime.substr(0, 10)}</div>
            <div>{loan.acceptedState}</div>
        </div>
        <div>
            Item Info
            <div>{item.title}</div>
            <div className="image-wrapper"><img src={item.uri}/></div>
            <div>{item.description}</div>
            <div>{item.status}</div>
        </div>
        {(loan.acceptedState === "PENDING") && <div onClick={acceptLoan}>
            Accept Loan
        </div>}
        {<div onClick={proposeNew}>Propose New</div>}
    </div>
}

function LoansList() {
    const [loans, setLoans] = useState([])

    useEffect(() => {
        axios.get(LOANS_API).then(response => setLoans(response.data))
    }, [])

    return <div className="loan-list">
        {loans.map(loan => <LoanPreview loan={loan}/>)}
    </div>
}

function Profile(props) {
    const [user, setUser] = useState({
        "email": "Placeholder.Placeholder@mail.com",
        "firstName": "Placeholder",
        "lastName": "Placeholder",
        "userId": 0
    })
    const navigate = useNavigate()
    const [editingFName, setEditingFName] = useState(false)
    const [editingLName, setEditingLName] = useState(false)
    const [editingEmail, setEditingEmail] = useState(false)

    useEffect(() => {
        axios.get(USERS_API + "/" + props.userId).then(response => setUser(response.data))
    }, [])

    function confirmChanges() {
        axios.patch(USERS_API + "/" + props.userId, user).then(() => navigate("/")).catch(res => alert(res.toString()))
    }

    return <div>
        <div>First Name: <div onClick={() => setEditingFName(true)}>{editingFName ?
            <input type="text" value={user.firstName} onChange={e => {
                const newUser = JSON.parse(JSON.stringify(user))
                newUser.firstName = e.target.value
                setUser(newUser)
            }}/> : user.firstName}</div></div>
        <div>Last Name: <div onClick={() => setEditingLName(true)}>{editingLName ?
            <input type="text" value={user.lastName} onChange={e => {
                const newUser = JSON.parse(JSON.stringify(user))
                newUser.lastName = e.target.value
                setUser(newUser)
            }}/> : user.lastName}</div></div>
        <div>Email: <div onClick={() => setEditingEmail(true)}>{editingEmail ?
            <input type="text" value={user.email} onChange={e => {
                const newUser = JSON.parse(JSON.stringify(user))
                newUser.email = e.target.value
                setUser(newUser)
            }}/> : user.email}</div></div>
        {(editingFName || editingLName || editingEmail) && <div onClick={() => confirmChanges()}>Confirm changes</div>}
        <BackButton/>
    </div>
}

function NewUserForm(props) {
    const [fName, setFName] = useState("")
    const [lName, setLName] = useState("")
    const [email, setEmail] = useState("")
    const navigate = useNavigate();

    function createUser() {
        const params = {
            email: email,
            firstName: fName,
            lastName: lName
        }
        axios.post(USERS_API, params).then(e => {
            props.onUserCreated(e.data.userId)
            navigate("/")
        }).catch(e => alert(e.toString()))
    }

    return <div>
        <div>First Name:<input type="text" onChange={e => setFName(e.target.value)} value={fName}/></div>
        <div>Last Name:<input type="text" onChange={e => setLName(e.target.value)} value={lName}/></div>
        <div>Email:<input type="text" onChange={e => setEmail(e.target.value)} value={email}/></div>
        <div onClick={createUser}>Create</div>
        <BackButton/>
    </div>
}

function NewItemForm(props) {
    const navigate = useNavigate()

    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [title, setTitle] = useState("")
    const [uri, setUri] = useState("")

    function newItem() {
        const item = {
            "category": category,
            "description": description,
            "userId": props.userId,
            "title": title,
            "uri": uri
        }
        axios.post(ITEMS_API, item).then(() => navigate("/items")).catch(e => alert(e.toString()))
    }

    return <div>
        <div>Category: <input type="text" value={category} onChange={e => setCategory(e.target.value)}/></div>
        <div>Description: <input type="text" value={description} onChange={e => setDescription(e.target.value)}/></div>
        <div>Title: <input type="text" value={title} onChange={e => setTitle(e.target.value)}/></div>
        <div>Uri: <input type="text" value={uri} onChange={e => setUri(e.target.value)}/></div>
        <div onClick={newItem}>Add Item</div>
        <BackButton/>
    </div>
}

function App() {
    let localUserId = localStorage.getItem('userId')
    const navigate = useNavigate();
    const [userId, setUserId] = useState(localUserId)
    const [borrowingItem, setBorrowingItem] = useState(null)

    function submitLoanProposal(from, to, desc) {
        const params = {
            "description": desc,
            "endTime": to.toISOString(),
            "fromId": borrowingItem.userId,
            "itemId": borrowingItem.itemId,
            "proposedById": parseInt(userId),
            "startTime": from.toISOString(),
            "toId": parseInt(userId)
        }
        axios.post(LOANS_API + "/propose", params)
            .then(e => navigate(-1))
            .catch(e => alert(e.toString()))
    }

    async function checkUserExists(id) {
        const userExists = {exists: false}
        axios.get(USERS_API + "/" + id).then(() => userExists.exists = true)
        return userExists.exists
    }

    function setUser(id) {
        if (id != null) {
            const userExists = checkUserExists(id)
            if (userExists) {
                localStorage.setItem('userId', id)
                setUserId(id)
            } else {
                alert("User doesn't exist.")
            }
        } else {
            setUserId(null)
            localStorage.setItem('userId', id)
        }
    }

    function logout() {
        setUser(null)
        navigate('/')
    }

    return (
        <div>{userId ? <NavBar/> : null}
            <Routes>
                <Route path="/" element={userId ? <Navigate to="/items"/> :
                    <div><LoginForm onSubmit={id => setUser(id)}/>
                        <div onClick={() => navigate("/new")}>New User</div>
                    </div>}/>
                <Route path="/new" element={<NewUserForm onUserCreated={setUser}/>}/>
                <Route path="/items" element={<ItemList onBorrow={setBorrowingItem}/>}/>
                <Route path="/items/new" element={<NewItemForm userId={userId}/>}/>
                <Route path="/items/:itemId"
                       element={<ItemBorrowForm submitLoanProposal={submitLoanProposal}/>}/>
                <Route path="/loans" element={<LoansList/>}/>
                <Route path="/loans/:loanId" element={<Loan/>}/>
                <Route path="/profile" element={<Profile userId={userId}/>}/>
            </Routes>
            {userId ? <div onClick={logout}>Logout</div> : null}
        </div>
    );
}

export default App;
