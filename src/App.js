import React, { useState, Fragment } from 'react'
import Particles from 'react-particles-js'
import Clarifai from 'clarifai'

import Navigaiton from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import './App.css'
require('dotenv').config()

const app = new Clarifai.App({
  apiKey: process.env.REACT_APP_CLARIFAI_API_KEY,
})

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800,
      },
    },
  },
}

function App() {
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [box, setBox] = useState({})
  const [boxes, setBoxes] = useState([])
  const [route, setRoute] = useState('signin') // keep track of where we are on the page.

  const calcualteFaceLocation = (data) => {
    console.log({ data })
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box

    const image = document.getElementById('input-image')
    const width = Number(image.width)
    const height = Number(image.height)

    const allRegions = data.outputs[0].data.regions.map((item) => {
      const bounding_box = item.region_info.bounding_box
      return {
        leftCol: bounding_box.left_col * width,
        topRow: bounding_box.top_row * height,
        rightCol: width - bounding_box.right_col * width,
        bottomRow: height - bounding_box.bottom_row * height,
      }
    })

    setBoxes(allRegions)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    }
  }

  const displayFaceBox = (box) => {
    setBox(box)
  }

  const onInputChange = (event) => {
    // console.log(event.target.value)
    setInput(event.target.value)
  }

  const onButtonSubmit = () => {
    setImageUrl(input)
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, input)
      .then((response) => displayFaceBox(calcualteFaceLocation(response)))
      .catch((err) => console.log(err))
  }

  const onRouteChange = (route) => {
    setRoute(route)
  }

  return (
    <div className="App">
      <Particles className="particles" params={particlesOptions} />
      <Navigaiton onRouteChange={onRouteChange} />
      {route === 'home' ? (
        <Fragment>
          <Logo />
          <Rank />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition box={box} boxes={boxes} imageUrl={imageUrl} />
        </Fragment>
      ) : route === 'signin' ? (
        <SignIn onRouteChange={onRouteChange} />
      ) : (
        <Register onRouteChange={onRouteChange} />
      )}
    </div>
  )
}

export default App
