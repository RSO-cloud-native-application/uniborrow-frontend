import logo from './logo.svg';
import './App.css';
import {useState} from "react";
import axios from "axios";
import {Link, Routes, Route, Navigate, useParams, useNavigate, Switch, NavLink} from "react-router-dom";

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

    const items = [{
        "category": "Books",
        "description": "Novel written by Leo Tolstoy.",
        "imageId": 1,
        "score": 1325,
        "status": "Available",
        "title": "War and Peace",
        "uri": "https://images-na.ssl-images-amazon.com/images/I/51J1nb00FLL._SX330_BO1,204,203,200_.jpg",
        "userId": 1
    }, {
        "category": "Vehicle",
        "description": "The ultimate bike for mountain off-road adventures! The most successful \"solid\" with a new \"racing\" geometry for even more power, stability and precision!",
        "imageId": 2,
        "score": 1325,
        "status": "Available",
        "title": "Mountain bike Olympia F1",
        "uri": "https://bike-shop.si/content/images/thumbs/0002065_gorsko-kolo-lf-sonora-29.jpeg",
        "userId": 1
    }, {
        "category": "Books",
        "description": "Novel written by Leo Tolstoy.",
        "imageId": 3,
        "score": 1325,
        "status": "Available",
        "title": "War and Peace",
        "uri": "https://images-na.ssl-images-amazon.com/images/I/51J1nb00FLL._SX330_BO1,204,203,200_.jpg",
        "userId": 1
    }]

    function onBorrow(item) {
        navigate("" + item.imageId)
    }

    return <div className="item-list">
        {items.map(item => <Item onBorrow={() => onBorrow(item)} item={item}/>)}
    </div>
}


function ItemBorrowForm(props) {
    const {itemId} = useParams();
    const navigate = useNavigate();
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [description, setDescription] = useState("")

    return <div className="item-borrow-form">
        <div> Description <input onChange={e => setDescription(e.target.value)} value={description} type="text"/></div>
        <div>From <input onChange={e => setFromDate(e.target.value)} value={fromDate} type="datetime-local"/></div>
        <div>To <input onChange={e => setToDate(e.target.value)} value={toDate} type="datetime-local"/></div>
        <div onClick={() => props.submitLoanProposal(fromDate, toDate, description, itemId)}>Submit</div>

        <div onClick={() => navigate(-1)}>Back</div>
    </div>
}

function NavBar() {
    return <div className="nav-bar">
        <NavLink to="/items">Items</NavLink>
        <NavLink to="/loans">My Loans</NavLink>
        <NavLink to="/profile">Profile</NavLink>
    </div>
}

function Loan(props) {
    const loan = props.loan
    return <div className="loan">
        <div>{loan.itemId}</div>
        <div>{loan.description}</div>
        <div>{loan.startTime.substr(0,10)} - {loan.endTime.substr(0,10)}</div>
        <div>{loan.acceptedState}</div>
    </div>
}

function LoansList() {
    const loans = [{
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
        "acceptedState": "PENDING",
        "description": "This is a very good loan.",
        "endTime": "2006-01-01T17:36:38Z",
        "fromId": 12,
        "id": 3,
        "itemId": 12,
        "proposedById": 25,
        "startTime": "2006-01-01T15:36:38Z",
        "toId": 25
    }, {
        "acceptedState": "PENDING",
        "description": "Bi slo morda za kak dan vec?",
        "endTime": "2019-08-18T14:38:40.108Z",
        "fromId": 1,
        "id": 4,
        "itemId": 2,
        "proposedById": 1,
        "startTime": "2019-08-18T14:38:40.108Z",
        "toId": 2
    }, {
        "acceptedState": "PENDING",
        "description": "Bi slo morda za kak dan vec?",
        "endTime": "2019-08-18T14:38:40.108Z",
        "fromId": 1,
        "id": 5,
        "itemId": 2,
        "proposedById": 1,
        "startTime": "2019-08-18T14:38:40.108Z",
        "toId": 2
    }, {
        "acceptedState": "PENDING",
        "description": "Bi slo morda za kak dan vec?",
        "endTime": "2019-08-18T14:38:40.108Z",
        "fromId": 1,
        "id": 6,
        "itemId": 2,
        "proposedById": 1,
        "startTime": "2019-08-18T14:38:40.108Z",
        "toId": 2
    }, {
        "acceptedState": "PENDING",
        "description": "Bi slo morda za kak dan vec?",
        "endTime": "2019-08-18T14:38:40.108Z",
        "fromId": 1,
        "id": 7,
        "itemId": 2,
        "proposedById": 1,
        "startTime": "2019-08-18T14:38:40.108Z",
        "toId": 2
    }]
    return <div className="loan-list">
        {loans.map(loan=><Loan loan={loan}/>)}
    </div>
}

function Profile(props) {
    const [user, setUser] = useState({
        "email": "jane.smith@mail.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "userId": 3
    })
    const navigate = useNavigate()
    const [editingFName, setEditingFName] = useState(false)
    const [editingLName, setEditingLName] = useState(false)
    const [editingEmail, setEditingEmail] = useState(false)

    function confirmChanges() {
        // send changes
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
        <div onClick={() => navigate(-1)}>Back</div>
    </div>
}

function App() {
    let localUserId = localStorage.getItem('userId')
    const navigate = useNavigate();
    const [userId, setUserId] = useState(localUserId)

    const borrowingItem = useParams();

    function submitLoanProposal(from, to, desc) {
        axios.post('http://35.223.79.242/uniborrow-loans/v1/loans',
            {
                "description": desc,
                "endTime": to,
                "fromId": borrowingItem.userId,
                "itemId": borrowingItem.imageId,
                "proposedById": userId,
                "startTime": from,
                "toId": userId
            },
        ).catch(e => console.log(e))
    }

    function setUser(id) {
        localStorage.setItem('userId', id)
        setUserId(id)
    }

    function logout() {
        setUser(null)
        navigate('/')
    }

    return (
        <div>{userId ? <NavBar/> : null}
            <Routes>
                <Route path="/" element={userId ? <Navigate to="/items"/> : <LoginForm onSubmit={id => setUser(id)}/>}/>
                <Route path="/items" element={<ItemList/>}/>
                <Route path="/items/:itemId"
                       element={<ItemBorrowForm submitLoanProposal={submitLoanProposal} item={borrowingItem}/>}/>
                <Route path="/loans" element={<LoansList/>}/>
                <Route path="/profile" element={<Profile/>}/>
            </Routes>
            {userId ? <div onClick={logout}>Logout</div> : null}
        </div>
    );
}

export default App;
