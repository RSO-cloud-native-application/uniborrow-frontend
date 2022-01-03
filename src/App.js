import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import {Routes, Route, Navigate, useNavigate, NavLink, useParams} from "react-router-dom";
import DateTimePicker from 'react-datetime-picker';
import logo from "./uniborrow.svg";
import * as PropTypes from "prop-types";

const LOANS_API = 'http://35.223.79.242/uniborrow-loans/v1/loans'
const USERS_API = 'http://35.223.79.242/uniborrow-users/v1/users'
const LOGIN_API = 'http://35.223.79.242/uniborrow-users/v1/login'
const ITEMS_API = 'http://35.223.79.242/uniborrow-items/v1/items'
const CASH_API = 'http://35.223.79.242/uniborrow-cash/v1/cash'
const CHAT_API = 'http://35.223.79.242/uniborrow-chat/v1/chat'
const REVIEWS_API = 'http://35.223.79.242/uniborrow-reviews/v1/'
const ITEM_REVIEWS_API = REVIEWS_API + "items/"
const USER_REVIEWS_API = REVIEWS_API + "users/"
const REQUESTS_API = 'http://35.223.79.242/uniborrow-requests/v1/requests'
const ADS_API = 'http://35.223.79.242/uniborrow-ads/v1/ads'
const BLOGS_API = 'http://35.223.79.242/uniborrow-blogs/v1/blogs'

function Ad() {
    const [ad, setAd] = useState({url: "", imageUrl: ""})
    useEffect(() => {
        axios.get(ADS_API).then(e => setAd(e.data)).catch(er => alert(er.toString()))
    }, [])
    return <img onClick={() => window.open(ad.url)} src={ad.imageUrl} className="ad">
    </img>
}

function Chat(props) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")

    function sendMessage() {
        axios.post(CHAT_API, {
            "message": newMessage,
            "userFromId": props.userId,
            "userToId": props.otherUserId
        }).then(e => {
            setMessages([...messages, e.data])
            setNewMessage("")
        }).catch(err => alert(err.toString()))
    }

    function onPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            sendMessage()
        }
    }

    useEffect(() => {
        axios.get(CHAT_API + "/private?userOne=" + props.userId + "&userTwo=" + props.otherUserId).then(res => setMessages(res.data)).catch(e => alert(e.toString()))
    }, [])

    return <div className="chat-wrp">
        <div className="chat">
            <h1>Chat with <UserLink userId={props.otherUserId}/></h1>
            {messages.map(message => <div
                className={"message" + ((props.userId == message.userFromId) ? " my" : " his")}>{message.message}</div>)}
            <div className="form-input msg-input"><input className="msg-txt-input" type="text" value={newMessage}
                                                         onChange={e => setNewMessage(e.target.value)}/>
                <div className="button" onKeyUp={onPress} onClick={sendMessage}>Send</div>
            </div>
        </div>
    </div>;
}

function Chats(props) {
    const [chats, setChats] = useState([])

    useEffect(() => {
        axios.get(CHAT_API + "/" + "?userId=" + props.userId).then(res => setChats(res.data)).catch(err => alert(err.toString()))
    }, [])

    return chats.map(otherUserId => <Chat userId={props.userId} otherUserId={otherUserId}></Chat>)
}

function LoginForm(props) {
    const [userInput, setUserInput] = useState("")
    const navigate = useNavigate()

    return <div className="login-form-wrp">
        <div className="login-form">
            <img src={logo}></img>
            <div>Username:</div>
            <div className="form-input"><input type="text" value={userInput}
                                               onChange={e => setUserInput(e.target.value)}/></div>
            <div className="button" onClick={() => props.onSubmit(userInput)}>Submit</div>
            <div className="button" onClick={() => navigate("/new")}>New User</div>
        </div>
    </div>
}

function ItemPreview(props) {
    const navigate = useNavigate()
    const item = props.item
    return <div onClick={() => navigate("/items/" + item.id)} className="item item-preview">
        <div>{item.title}</div>
        <div className="image-wrapper"><img src={item.uri}/></div>
        <div>{item.description}</div>
        <div>{item.status}</div>
    </div>
}

function Item() {
    const {itemId} = useParams()
    const [item, setItem] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(ITEMS_API + "/" + itemId).then((e) => setItem(e.data)).catch((e) => alert(e.toString()))
    }, [])

    return <div>
        <div className="item">
            <div>{item.title}</div>
            <div className="image-wrapper"><img src={item.uri}/></div>
            <div>{item.description}</div>
            <div>{item.status}</div>
            <UserLink key={item.title} userId={item.userId}/>
            <div onClick={() => navigate("/items/borrow/" + itemId)}>Borrow</div>
        </div>
        <div>
            <h1>Reviews</h1>
            <ReviewList itemId={itemId}/>
        </div>
    </div>
}

function ItemList(props) {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [searchParam, setSearchParam] = useState("")

    function fetchData() {
        axios.get(ITEMS_API + "/?filter=title:LIKEIC:%" + searchParam + "%,description:LIKEIC:%" + searchParam + "%").then(response => setItems(response.data)).catch(re => alert(re.toString()))
    }

    useEffect(() => {
        fetchData()
    }, [])

    return <div className="item-list">
        <div className="search-row"><input type="text" onChange={e => setSearchParam(e.target.value)}
                                           value={searchParam}/>
            <div className="button" onClick={() => fetchData()}>Search</div>
        </div>
        {items.map(item => <ItemPreview item={item}/>)}
        <div className="button" onClick={() => navigate("/items/new")}>Add New Item</div>
    </div>
}


function ItemBorrowForm(props) {
    const {itemId} = useParams()
    const navigate = useNavigate()
    const [item, setItem] = useState({})
    const [price, setPrice] = useState("0")
    const [fromDate, setFromDate] = useState(new Date())
    const [toDate, setToDate] = useState(new Date())
    const [description, setDescription] = useState("")

    useEffect(() => {
        axios.get(ITEMS_API + "/" + itemId).then(res => setItem(res.data)).catch(e => alert(e.toString()))
    }, [])

    function submitLoanProposal(item, description, fromDate, price, toDate) {
        const params = {
            "description": description,
            "endTime": toDate.toISOString(),
            "fromId": item.userId,
            "itemId": item.itemId,
            "proposedById": parseInt(props.userId),
            "startTime": fromDate.toISOString(),
            "toId": parseInt(props.userId),
            "price": parseFloat(price)
        }
        axios.post(LOANS_API + "/propose", params)
            .then(e => navigate(-1))
            .catch(e => alert(e.toString()))
    }

    return <div className="item-borrow-form-wrp">
        <div className="item-borrow-form">
            <h1>Borrow Item</h1>
            <div className="form-input">Description <textarea className="desc-txt-area"
                                                              onChange={e => setDescription(e.target.value)}
                                                              value={description} type="text"/>
            </div>
            <div className="form-input">From <DateTimePicker onChange={setFromDate} value={fromDate}/></div>
            <div className="form-input">To <DateTimePicker onChange={setToDate} value={toDate}/></div>
            <div className="form-input">Price <input type="number" onChange={e => setPrice(e.target.value)}
                                                     value={price}/></div>
            <div className="button"
                 onClick={() => submitLoanProposal(item, description, fromDate, price, toDate)}>Submit
            </div>
            <BackButton/></div>
    </div>
}

function RequestPreview(props) {
    const request = props.request
    const navigate = useNavigate()

    return <div className="item">
        <div>
            {request.title}
        </div>
        <div>{request.message}</div>
        <div>
            <div>{request.timestampStart.substr(0, 10)} - {request.timestampEnd.substr(0, 10)}</div>
        </div>
        <div>{request.price}</div>
        <UserLink userId={props.request.userId}/>
        <div className="acceopt-request" onClick={() => navigate("/requests/accept/" + props.request.id)}>Accept
            Request
        </div>
    </div>
}


function RequestList(props) {
    const [requests, setRequests] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(REQUESTS_API + "/active").then(e => setRequests(e.data)).catch(e => alert(e.toString()))
    }, [])

    return <div className="requests-container"><h1>Requests</h1>
        {requests.map(request => <RequestPreview request={request}/>)}
        <div className="button" onClick={() => navigate("/requests/new")}>Add New Request</div>
    </div>
}

function NavBar() {
    return <div className="nav-bar">
        <img className="bar-logo" src={logo}></img>
        <NavLink to="/items">Items</NavLink>
        <NavLink to="/requests">Requests</NavLink>
        <NavLink to="/loans">My Loans</NavLink>
        <NavLink to="/profile">My Profile</NavLink>
        <NavLink to="/chat">Messages</NavLink>
        <NavLink to="/blog">Blog</NavLink>
        <NavLink to="/logout">Logout</NavLink>
    </div>
}

function BlogEntry(props) {
    const entry = props.entry
    return <div className="blog-entry">
        <h1>{entry.title}</h1>
        <div>{entry.text}</div>
    </div>
}


function Blog(props) {
    const [blogEntries, setBlogEntries] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [title, setTitle] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(BLOGS_API).then(e => setBlogEntries(e.data)).catch(e => alert(e.toString()))
    }, [])

    function sendMessage() {
        axios.post(BLOGS_API, {
            "text": newMessage,
            "title": title,
            "userId": props.userId
        }).then(() => navigate(-1)).catch(er => alert(er.toString()))
    }

    return <div className="blog">
        {blogEntries.map(entry => <BlogEntry entry={entry}/>)}
        <div className="write-blog-wrapper">
            <div className="form-input msg-input">Title:<input className="msg-txt-input" type="text" value={title}
                                                               onChange={e => setTitle(e.target.value)}/></div>
            <div className="form-input msg-input"><textarea className="msg-txt-input" type="text" value={newMessage}
                                                            onChange={e => setNewMessage(e.target.value)}/></div>
            <div className="button" onClick={sendMessage}>Send</div>
        </div>
    </div>

}

function Review(props) {
    const review = props.review
    return <div className="review">
        <div><b>Ocena: {review.stars}</b></div>
        <div>{review.message}</div>
    </div>
}

function ReviewList(props) {
    const [reviews, setReviews] = useState([])

    useEffect(() => {
        axios.get(ITEM_REVIEWS_API + "?itemId=" + props.itemId).then(e => setReviews(e.data)).catch((e) => alert(e.toString()))
    }, [])

    return <div className="reviews">
        {reviews.map(review => <Review review={review}/>)}
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

    function getRightUserId() {
        if (loan.fromId != props.userId) {
            return loan.fromId
        } else {
            return loan.toId
        }
    }

    return <div className="loan-info-wrp">
        <div className="loan-info">
            Loan Info
            <div>Item id:{loan.itemId}</div>
            <div>Description:{loan.description}</div>
            <div>Period:{loan.startTime && loan.startTime.substr(0, 10)} - {loan.endTime && loan.endTime.substr(0, 10)}</div>
            <div>Price:{loan.price}EUR</div>
            <div>State:{loan.acceptedState}</div>
            <div>With: <UserLink key={loan.toId} userId={getRightUserId()}/></div>
        </div>
        <div className="loan-info">
            Item Info
            <div>{item.title}</div>
            <div className="image-wrapper"><img src={item.uri}/></div>
            <div>Description:{item.description}</div>
        </div>
        {(loan.acceptedState === "PENDING" && loan.proposedById != props.userId) &&
        <div className="button" onClick={acceptLoan}>
            Accept Loan
        </div>}{(loan.acceptedState === "PENDING" && loan.proposedById != props.userId) &&
    <div className="button" onClick={rejectLoan}>
        Reject Loan
    </div>}
        {(loan.acceptedState === "ACCEPTED") &&
        <div className="button" onClick={() => navigate("/userreview/" + getRightUserId())}>
            Write User Review
        </div>}
        {(loan.acceptedState === "ACCEPTED" && item.userId != props.userId) &&
        <div className="button" onClick={() => navigate("/itemreview/" + loan.itemId)}>
            Write Item Review
        </div>}
    </div>
}

function LoansList(props) {
    const userId = props.userId
    const [loans, setLoans] = useState([])

    useEffect(() => {
        axios.get(LOANS_API + "?filter=fromId:EQ:" + userId + ",toId:EQ:" + userId).then(response => setLoans(response.data)).catch(e => alert(e.toString()))
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
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function addCash() {
        await axios.post(CASH_API + "/" + props.userId + "/add?amount=" + cashToAdd + "&currency=" + currency).then(e => navigate("/profile"))
        await fetchData(currency)
    }

    async function withdrawCash() {
        await axios.post(CASH_API + "/" + props.userId + "/withdraw?amount=" + cashToWithdraw + "&currency=" + currency).then(e => navigate("/profile")).catch(e => alert(e.toString()))
        fetchData(currency)
    }

    function fetchData(currency) {
        axios.get(CASH_API + "/" + props.userId + "?currency=" + currency).then(response => setCurrentCash(response.data.currentCash)).catch(e => alert(e.toString()))
    }

    async function setKurency(currency) {
        setCurrency(currency)
        fetchData(currency)
    }

    useEffect(() => {
        fetchData(currency)
    }, [])

    return <div className="profile-wrapper">
        <div className="profile-form">
            <h1>Cash Information</h1>
            <select onChange={e => setKurency(e.target.value)} value={currency}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
            </select>
            <div className="profile-setting form-input">Current Cash: {loading ?
                <div>Loading...</div> : currentCash}{currency}</div>
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
    const [userName, setUserName] = useState("")
    const [fName, setFName] = useState("")
    const [lName, setLName] = useState("")
    const [email, setEmail] = useState("")
    const navigate = useNavigate();

    function createUser() {
        const params = {
            username: userName,
            email: email,
            firstName: fName,
            lastName: lName
        }
        axios.post(USERS_API, params).then(e => {
            props.onUserCreated(e.data.userId)
            navigate("/")
        }).catch(e => alert(e.toString()))
    }

    return <div className="profile-wrapper">
        <div className="profile-form">
            <div className="form-input">Username:<input type="text" onChange={e => setUserName(e.target.value)}
                                                        value={userName}/></div>
            <div className="form-input">First Name:<input type="text" onChange={e => setFName(e.target.value)}
                                                          value={fName}/></div>
            <div className="form-input">Last Name:<input type="text" onChange={e => setLName(e.target.value)}
                                                         value={lName}/></div>
            <div className="form-input">Email:<input type="text" onChange={e => setEmail(e.target.value)}
                                                     value={email}/></div>
            <div className="button" onClick={createUser}>Create</div>
            <BackButton/></div>
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
            <h1>New Item</h1>
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


function NewItemReviewForm(props) {
    const navigate = useNavigate()
    const {itemId} = useParams()

    const [description, setDescription] = useState("")
    const [stars, setStars] = useState("")

    function sendReview() {
        const item = {
            "itemId": itemId,
            "message": description,
            "stars": stars,
            "userReviewerId": props.userId
        }
        axios.post(ITEM_REVIEWS_API, item).then(() => navigate("/items")).catch(e => alert(e.toString()))
    }

    return <div className="add-item-form-wrp">
        <div className="add-item-form">
            <div className="form-input">Stars: <input type="Number" value={stars}
                                                      onChange={e => setStars(e.target.value)}/></div>
            <div className="form-input">Comment: <textarea type="number" value={description}
                                                           onChange={e => setDescription(e.target.value)}/></div>
            <div className="button" onClick={sendReview}>Add Item Review</div>
            <BackButton/>
        </div>
    </div>
}


function NewUserReview(props) {
    const navigate = useNavigate()
    const {userId} = useParams()

    const [description, setDescription] = useState("")
    const [stars, setStars] = useState("")

    function sendReview() {
        const item = {
            "userId": userId,
            "message": description,
            "stars": stars,
            "userReviewerId": props.userId
        }
        axios.post(USER_REVIEWS_API, item).then(() => navigate("/items")).catch(e => alert(e.toString()))
    }

    return <div className="add-item-form-wrp">
        <div className="add-item-form">
            <div className="form-input">Stars: <input type="Number" value={stars}
                                                      onChange={e => setStars(e.target.value)}/></div>
            <div className="form-input">Comment: <textarea type="number" value={description}
                                                           onChange={e => setDescription(e.target.value)}/></div>
            <div className="button" onClick={sendReview}>Add User Review</div>
            <BackButton/>
        </div>
    </div>
}

function NewRequestForm(props) {
    const [title, setTitle] = useState("")
    const [price, setPrice] = useState("0")
    const [fromDate, setFromDate] = useState(new Date())
    const [toDate, setToDate] = useState(new Date())
    const [description, setDescription] = useState("")
    const navigate = useNavigate();

    function submitRequest() {
        const params = {
            "message": description,
            "timestampEnd": toDate.toISOString(),
            "userId": parseInt(props.userId),
            "timestampStart": fromDate.toISOString(),
            "title": title,
            "price": parseFloat(price)
        }
        axios.post(REQUESTS_API, params)
            .then(e => navigate("/"))
            .catch(e => alert(e.toString()))
    }

    return <div className="item-borrow-form-wrp">
        <div className="item-borrow-form">
            <h1>New Request</h1>
            <div className="form-input">Title <input type="text" onChange={e => setTitle(e.target.value)}
                                                     value={title}/></div>
            <div className="form-input">Message <textarea className="desc-txt-area"
                                                          onChange={e => setDescription(e.target.value)}
                                                          value={description} type="text"/>
            </div>
            <div className="form-input">From <DateTimePicker onChange={setFromDate} value={fromDate}/></div>
            <div className="form-input">To <DateTimePicker onChange={setToDate} value={toDate}/></div>
            <div className="form-input">Price <input type="number" onChange={e => setPrice(e.target.value)}
                                                     value={price}/></div>
            <div className="button"
                 onClick={submitRequest}>Submit
            </div>
            <BackButton/></div>
    </div>
}


function AcceptRequestForm(props) {

    const {requestId} = useParams()

    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("0")
    const [url, setUrl] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [description, setDescription] = useState("")
    const [userTo, setUserTo] = useState(0)
    const [requestLoaded, setRequestLoaded] = useState(false)
    const navigate = useNavigate();


    useEffect(() => {
        axios.get(REQUESTS_API + "/" + requestId).then(e => setRequest(e.data)).catch(e => alert(e.toString()))
    }, [])

    function setRequest(request) {
        setFromDate(request.timestampStart)
        setToDate(request.timestampEnd)
        setPrice(request.price)
        setTitle(request.title)
        setUserTo(request.userId)
        setRequestLoaded(true)
    }

    function addNewItem() {
        const item = {
            "category": category,
            "description": description,
            "userId": props.userId,
            "title": title,
            "uri": url
        }
        axios.post(ITEMS_API, item).then((e) => submitLoanProposal(e.data.id)).catch(e => alert(e.toString()))
    }

    function submitLoanProposal(itemId) {
        const params = {
            "description": description,
            "endTime": toDate,
            "fromId": props.userId,
            "itemId": itemId,
            "proposedById": parseInt(props.userId),
            "startTime": fromDate,
            "toId": userTo,
            "price": parseFloat(price)
        }
        axios.post(LOANS_API + "/propose", params)
            .then(e => navigate(-1))
            .catch(e => alert(e.toString()))
    }


    return <div className="item-borrow-form-wrp">
        {requestLoaded ?
            <div className="item-borrow-form">
                <h1>Accepting Request</h1>
                <div className="form-input">Item Title <input type="text" onChange={e => setTitle(e.target.value)}
                                                              value={title}/></div>
                <div className="form-input">Description <textarea className="desc-txt-area"
                                                                  onChange={e => setDescription(e.target.value)}
                                                                  value={description} type="text"/>
                </div>
                <div className="form-input">Price <input type="number" onChange={e => setPrice(e.target.value)}
                                                         value={price}/></div>
                <div className="form-input">Category <input type="text" onChange={e => setCategory(e.target.value)}
                                                            value={category}/></div>
                <div className="form-input">Item image URL <input type="text" onChange={e => setUrl(e.target.value)}
                                                                  value={url}/></div>
                <div>Date from: {fromDate}</div>
                <div>Date to: {toDate}</div>
                <div className="button"
                     onClick={addNewItem}>Submit
                </div>
                <BackButton/></div> : <div>Loading...</div>}
    </div>
}

function TransactionsInfo(props) {
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        axios.get(CASH_API + "/transactions/" + props.userId).then(res => setTransactions(res.data)).catch(e => alert(e.toString()))
    }, [])

    function amountFromTransaction(cash, fromId, toId) {
        let transType;
        if (fromId === toId) {
            if (cash < 0) {
                transType = ["WITHDRAWAL", cash]
            } else {
                transType = ["DEPOSIT", cash]
            }
        } else if (toId == props.userId) {
            transType = ["RECEIVE", cash]
        } else if (fromId == props.userId) {
            transType = ["SEND", cash]
        }
        return <div>{transType[0]} {transType[1]}EUR</div>
    }

    return <div className="add-item-form-wrp">
        <div className="add-item-form">
            <h1>Transactions</h1>
            {transactions.map(transaction =>
                <div
                    className="form-input"> {amountFromTransaction(transaction.cash, transaction.fromId, transaction.toId)}</div>)}
        </div>
    </div>
}

function UserLink(props) {
    const navigate = useNavigate()
    const [username, setUserName] = useState("Loading...")
    useEffect(() => {
        axios.get(USERS_API + "/" + props.userId).then(e => setUserName(e.data.username)).catch(e => console.log(e.toString()))
    }, [])

    return <div className="userlink" onClick={() => navigate("/users/" + props.userId)}>{username}</div>
}

function NewMessage(props) {
    const [newMessage, setNewMessage] = useState("")

    function sendMessage() {
        axios.post(CHAT_API, {
            "message": newMessage,
            "userFromId": props.fromUserId,
            "userToId": props.toUserId
        }).then(e => {
            setNewMessage("")
        }).catch(err => alert(err.toString()))
    }
    return <div className="write-blog-wrapper">
        Send a message to the user
        <div className="form-input msg-input"><input className="msg-txt-input" type="text" value={newMessage}
                                                     onChange={e => setNewMessage(e.target.value)}/>
            <div className="button" onClick={sendMessage}>Send</div>
        </div>
    </div>
}


function OtherUserInfo(props) {
    const {userId} = useParams()
    const [user, setUser] = useState("")
    const [reviews, setReviews] = useState([])

    useEffect(() => {
        axios.get(USERS_API + "/" + userId).then(e => setUser(e.data)).catch(e => alert(e.toString()))
        axios.get(USER_REVIEWS_API + "?forUserId=" + userId).then(e => setReviews(e.data)).catch(e => alert(e.toString()))
    }, [])


    return <div>
        <div className="profile-wrapper">
            <div className="profile-form">
                <h1>User Information</h1>
                <div className="profile-setting form-input">First Name: <div>{user.firstName}</div></div>
                <div className="profile-setting form-input">Last Name: <div>{user.lastName}</div></div>
                <div className="profile-setting form-input">Email: <div>{user.email}</div></div>

            </div>
            <h1>User Reviews</h1>
            {reviews.map(review => <Review review={review}/>)}
            <NewMessage fromUserId={props.userId} toUserId={userId}/>
        </div>
    </div>
}


function Profile(props) {
    return <div><UserInfo userId={props.userId}/><CashInfo userId={props.userId}/><TransactionsInfo
        userId={props.userId}/></div>
}

function App() {
    let localUserId = localStorage.getItem('userId')
    const navigate = useNavigate();
    const [userId, setUserId] = useState(localUserId)

    async function checkUserExists(userName) {
        try {
            const resp = await axios.post(LOGIN_API, {username: userName})
            if (resp.status === 200) {
                return resp.data
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    async function setUser(userName) {
        if (userName != null) {
            const user = await checkUserExists(userName)
            if (user) {
                localStorage.setItem('userId', user.userId)
                setUserId(user.userId)
            } else {
                alert("User doesn't exist.")
            }
        } else {
            setUserId(null)
            localStorage.removeItem('userId')
        }
    }

    function Logout() {
        setUser(null).then(() => navigate('/'))
        return <Navigate to="/"/>
    }

    return (
        <div className="app">{userId ? <NavBar/> : null}
            <Routes>
                <Route path="/" element={userId ? <Navigate to="/items"/> :
                    <div><LoginForm onSubmit={userName => setUser(userName)}/>
                    </div>}/>
                <Route path="/new" element={<NewUserForm onUserCreated={setUserId}/>}/>
                <Route path="/items" element={<ItemList/>}/>
                <Route path="/items/new" element={<NewItemForm userId={userId}/>}/>
                <Route path="/items/borrow/:itemId"
                       element={<ItemBorrowForm userId={userId}/>}/>
                <Route path="/items/:itemId" element={<Item/>}/>
                <Route path="/loans" element={<LoansList userId={userId}/>}/>
                <Route path="/loans/:loanId" element={<Loan userId={userId}/>}/>
                <Route path="/profile" element={<Profile userId={userId}/>}/>
                <Route path="/chat" element={<Chats userId={userId}/>}/>
                <Route path="/requests" element={<RequestList/>}/>
                <Route path="/requests/new" element={<NewRequestForm userId={userId}/>}/>
                <Route path="/requests/accept/:requestId" element={<AcceptRequestForm userId={userId}/>}/>
                <Route path="/logout" element={<Logout/>}/>
                <Route path="/userreview/:userId" element={<NewUserReview userId={userId}/>}/>
                <Route path="/itemreview/:itemId" element={<NewItemReviewForm userId={userId}/>}/>
                <Route path="/blog" element={<Blog userId={userId}/>}/>
                <Route path="/users/:userId" element={<OtherUserInfo userId={userId}/>}/>
            </Routes>
            <div className="ads-container">
                <Ad/></div>
        </div>
    );
}

export default App;
