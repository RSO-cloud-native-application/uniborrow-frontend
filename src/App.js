import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import {Routes, Route, Navigate, useNavigate, NavLink, useParams} from "react-router-dom";
import DateTimePicker from 'react-datetime-picker';
import logo from "./uniborrow.svg";
import * as PropTypes from "prop-types";

const LOANS_API = 'http://35.223.79.242/uniborrow-loans/v1/loans'
const USERS_API = 'http://35.223.79.242/uniborrow-users/v1/users'
const ITEMS_API = 'http://35.223.79.242/uniborrow-items/v1/items'
const CASH_API = 'http://35.223.79.242/uniborrow-cash/v1/cash'

function LoginForm(props) {
    const [userInput, setUserInput] = useState("")
    const navigate = useNavigate()

    function submit() {
        props.onSubmit(userInput)
    }

    return <div className="login-form-wrp">
        <div className="login-form">
            <img src={logo}></img>
            <div>UserId:</div>
            <div className="form-input"><input type="text" value={userInput}
                                               onChange={e => setUserInput(e.target.value)}/></div>
            <div className="button" onClick={() => submit()}>Submit</div>
            <div className="button" onClick={() => navigate("/new")}>New User</div>
        </div>
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
    const [searchParam, setSearchParam] = useState("")

    const testItems = [{
        "category": "Books",
        "description": "Novel written by Leo Tolstoy.",
        "itemId": 1,
        "score": 1325,
        "status": "Available",
        "title": "War and Peace",
        "uri": "https://images-na.ssl-images-amazon.com/images/I/51J1nb00FLL._SX330_BO1,204,203,200_.jpg",
        "userId": 1
    }, {
        "category": "Vehicle",
        "description": "The ultimate bike for mountain off-road adventures! The most successful \"solid\" with a new \"racing\" geometry for even more power, stability and precision!",
        "itemId": 2,
        "score": 1325,
        "status": "Available",
        "title": "Mountain bike Olympia F1",
        "uri": "https://bike-shop.si/content/images/thumbs/0002065_gorsko-kolo-lf-sonora-29.jpeg",
        "userId": 1
    }, {
        "category": "Musical Instruments",
        "description": "The Yamaha F310 is everything youve been looking for. It combines superb value for money with Yamahas long heritage of creating high-quality instruments. This F310 Acoustic is no exception to their meticulous standards.",
        "itemId": 3,
        "score": 1325,
        "status": "Available",
        "title": "Guitar",
        "uri": "https://d1aeri3ty3izns.cloudfront.net/media/68/681431/1200/preview.jpg",
        "userId": 1
    }]

    function fetchData() {
        axios.get(ITEMS_API + "/?filter=title:LIKE:%" + searchParam + "%,description:LIKE:%" + searchParam + "%").then(response => setItems(response.data)).catch(re => setItems(testItems))
    }

    useEffect(() => {
        fetchData()
    }, [])

    function onBorrow(item) {
        props.onBorrow(item)
        navigate("" + item.itemId)
    }

    return <div className="item-list">
        <div className="search-row"><input type="text" onChange={e => setSearchParam(e.target.value)}
                                           value={searchParam}/>
            <div className="button" onClick={() => fetchData()}>Search</div>
        </div>
        {items.map(item => <Item onBorrow={() => onBorrow(item)} item={item}/>)}
        <div className="button" onClick={() => navigate("/items/new")}>Add New Item</div>
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
        if (props.loan) {
            setFromDate(props.loan.from)
        }
        axios.get(ITEMS_API + "/" + itemId).then(res => setItem(res.data)).catch(e => alert(e.toString()))
    }, [])

    return <div className="item-borrow-form-wrp">
        <div className="item-borrow-form">
            <div className="form-input">Description <textarea className="desc-txt-area"
                                                              onChange={e => setDescription(e.target.value)}
                                                              value={description} type="text"/>
            </div>
            <div className="form-input">From <DateTimePicker onChange={setFromDate} value={fromDate}/></div>
            <div className="form-input">To <DateTimePicker onChange={setToDate} value={toDate}/></div>
            <div className="button"
                 onClick={() => props.submitLoanProposal(fromDate, toDate, description, item)}>Submit
            </div>
            <BackButton/></div>
    </div>
}

function NavBar() {
    return <div className="nav-bar">
        <img className="bar-logo" src={logo}></img>
        <NavLink to="/items">Items</NavLink>
        <NavLink to="/loans">My Loans</NavLink>
        <NavLink to="/profile">My Profile</NavLink>
        <NavLink to="/logout">Logout</NavLink>
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

    return <div className="button" onClick={() => navigate(-1)}>Back</div>
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

    function rejectLoan() {
        axios.post(LOANS_API + "/" + loanId + "/" + "reject").then(e => navigate("/loans"))
    }

    return <div className="loan-info-wrp">
        <div className="loan-info">
            Loan Info
            <div>{loan.itemId}</div>
            <div>{loan.description}</div>
            <div>{loan.startTime && loan.startTime.substr(0, 10)} - {loan.endTime && loan.endTime.substr(0, 10)}</div>
            <div>{loan.acceptedState}</div>
        </div>
        <div className="loan-info">
            Item Info
            <div>{item.title}</div>
            <div className="image-wrapper"><img src={item.uri}/></div>
            <div>{item.description}</div>
            <div>{item.status}</div>
        </div>
        {(loan.acceptedState === "PENDING" && loan.proposedById != props.userId) &&
        <div className="button" onClick={acceptLoan}>
            Accept Loan
        </div>}{(loan.acceptedState === "PENDING" && loan.proposedById != props.userId) &&
    <div className="button" onClick={rejectLoan}>
        Reject Loan
    </div>}
    </div>
}

function LoansList(props) {
    const userId = props.userId
    const [loans, setLoans] = useState([])
    const testLoans = [{
        "acceptedState": "ACCEPTED",
        "description": "This is a very good loan.",
        "endTime": "2006-01-01T17:36:38Z",
        "fromId": 1280,
        "id": 1,
        "itemId": 123213,
        "proposedById": 1280,
        "startTime": "2006-01-01T15:36:38Z",
        "toId": 1325
    }, {
        "acceptedState": "REJECTED",
        "description": "This is a very good loan.",
        "endTime": "2006-01-01T17:36:38Z",
        "fromId": 12,
        "id": 2,
        "itemId": 1,
        "proposedById": 1280,
        "startTime": "2006-01-01T15:36:38Z",
        "toId": 1325
    }, {
        "acceptedState": "ACCEPTED",
        "description": "sdas",
        "endTime": "2021-12-29T14:40:44.252Z",
        "fromId": 1,
        "id": 4,
        "itemId": 1,
        "proposedById": 2,
        "startTime": "2021-12-29T14:40:44.252Z",
        "toId": 2
    }, {
        "acceptedState": "ACCEPTED",
        "description": "This is a very good loan.",
        "endTime": "2006-01-01T17:36:38Z",
        "fromId": 12,
        "id": 3,
        "itemId": 12,
        "proposedById": 25,
        "startTime": "2006-01-01T15:36:38Z",
        "toId": 25
    }, {
        "acceptedState": "ACCEPTED",
        "description": "waaa",
        "endTime": "2021-12-29T15:46:50.580Z",
        "fromId": 1,
        "id": 5,
        "itemId": 3,
        "proposedById": 2,
        "startTime": "2021-12-29T15:46:50.580Z",
        "toId": 2
    }, {
        "acceptedState": "PENDING",
        "description": "I really want it dude please.",
        "endTime": "2021-12-31T17:24:41.096Z",
        "fromId": 1,
        "id": 6,
        "itemId": 2,
        "proposedById": 3,
        "startTime": "2021-12-29T17:24:41.096Z",
        "toId": 3
    }]
    useEffect(() => {
        axios.get(LOANS_API + "?filter=fromId:EQ:" + userId + ",toId:EQ:" + userId).then(response => setLoans(response.data)).catch(e => setLoans(testLoans))
    }, [])

    return <div className="loan-list">
        {loans.map(loan => <LoanPreview loan={loan}/>)}
    </div>
}

function CashInfo(props) {
    const [currency, setCurrency] = useState("EUR")
    const [currentCash, setCurrentCash] = useState(0)
    const [cashToAdd, setCashToAdd] = useState(0)
    const [cashToWithdraw, setCashToWithdraw] = useState(0)
    const navigate = useNavigate()

    function addCash() {
        axios.post(CASH_API + "/" + props.userId + "/add?amount=" + cashToAdd + "&currency=" + currency).then(e => navigate("/profile")).catch(e => alert(e.toString()))
    }

    function withdrawCash() {
        axios.post(CASH_API + "/" + props.userId + "/withdraw?amount=" + cashToAdd + "&currency=" + currency).then(e => navigate("/profile")).catch(e => alert(e.toString()))
    }

    useEffect(() => {
        axios.get(CASH_API + "/" + props.userId + "&currency=" + currency).then(response => setCurrentCash(response.data.currentCash)).catch(e => setCurrentCash(150))
    }, [])

    return <div className="profile-wrapper">
        <div className="profile-form">
            <h1>Cash Information</h1>
            <select onChange={e => setCurrency(e.target.value)} value={currency}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
            </select>
            <div className="profile-setting form-input">Current Cash: {currentCash}</div>
            <div className="form-input"><input type="number" value={cashToAdd}
                                               onChange={e => setCashToAdd(e.target.value)}/>
                <div onClick={addCash} className="button">Add cash</div>
            </div>
            <div className="form-input"><input type="number" value={cashToWithdraw}
                                               onChange={e => setCashToWithdraw(e.target.value)}/>
                <div onClick={withdrawCash} className="button">Withdraw cash</div>
            </div>
        </div>
    </div>
}

function UserInfo(props) {
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

    return <div className="profile-wrapper">
        <div className="profile-form">
            <h1>User Information</h1>
            <div className="profile-setting form-input">First Name: <div
                onClick={() => setEditingFName(true)}>{editingFName ?
                <input type="text" value={user.firstName} onChange={e => {
                    const newUser = JSON.parse(JSON.stringify(user))
                    newUser.firstName = e.target.value
                    setUser(newUser)
                }}/> : user.firstName}</div></div>
            <div className="profile-setting form-input">Last Name: <div
                onClick={() => setEditingLName(true)}>{editingLName ?
                <input type="text" value={user.lastName} onChange={e => {
                    const newUser = JSON.parse(JSON.stringify(user))
                    newUser.lastName = e.target.value
                    setUser(newUser)
                }}/> : user.lastName}</div></div>
            <div className="profile-setting form-input">Email: <div
                onClick={() => setEditingEmail(true)}>{editingEmail ?
                <input type="text" value={user.email} onChange={e => {
                    const newUser = JSON.parse(JSON.stringify(user))
                    newUser.email = e.target.value
                    setUser(newUser)
                }}/> : user.email}</div></div>
            {(editingFName || editingLName || editingEmail) &&
            <div className="button" onClick={() => confirmChanges()}>Confirm changes</div>}
        </div>
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

    return <div className="add-item-form-wrp">
        <div className="add-item-form">
            <div className="form-input">Title: <input type="text" value={title}
                                                      onChange={e => setTitle(e.target.value)}/></div>
            <div className="form-input">Category: <input type="text" value={category}
                                                         onChange={e => setCategory(e.target.value)}/></div>
            <div className="form-input">Description: <textarea type="text" value={description}
                                                               onChange={e => setDescription(e.target.value)}/></div>
            <div className="form-input">Image url: <input type="text" value={uri}
                                                          onChange={e => setUri(e.target.value)}/></div>
            <div className="button" onClick={newItem}>Add New Item</div>
            <BackButton/>
        </div>
    </div>
}

function Profile(props) {
    return <div><UserInfo userId={props.userId}/><CashInfo userId={props.userId}/></div>
}

Profile.propTypes = {
    userId: PropTypes.string,
    children: PropTypes.node
};

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

    function Logout() {
        setUser(null)
        navigate('/')
        return <Navigate to="/"/>
    }

    return (
        <div className="app">{userId ? <NavBar/> : null}
            <Routes>
                <Route path="/" element={userId ? <Navigate to="/items"/> :
                    <div><LoginForm onSubmit={id => setUser(id)}/>
                    </div>}/>
                <Route path="/new" element={<NewUserForm onUserCreated={setUser}/>}/>
                <Route path="/items" element={<ItemList onBorrow={setBorrowingItem}/>}/>
                <Route path="/items/new" element={<NewItemForm userId={userId}/>}/>
                <Route path="/items/:itemId"
                       element={<ItemBorrowForm submitLoanProposal={submitLoanProposal}/>}/>
                <Route path="/loans" element={<LoansList userId={userId}/>}/>
                <Route path="/loans/:loanId" element={<Loan userId={userId}/>}/>
                <Route path="/profile" element={<Profile userId={userId}/>}/>
                <Route path="/logout" element={<Logout/>}/>
            </Routes>
        </div>
    );
}

export default App;
