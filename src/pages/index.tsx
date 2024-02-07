import { api } from "~/utils/api";

export default function Home() {
  return (
    <>

    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Fantasy F1 Driver Selection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="border rounded-lg p-4 flex flex-col items-center text-center">
          <img
            alt="Driver 1"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Driver 1</h2>
          <img
            alt="Team 1"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center text-center">
          <img
            alt="Driver 2"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Driver 2</h2>
          <img
            alt="Team 2"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center text-center">
          <img
            alt="Driver 3"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Driver 3</h2>
          <img
            alt="Team 3"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center text-center">
          <img
            alt="Driver 4"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Driver 4</h2>
          <img
            alt="Team 4"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center text-center">
          <img
            alt="Driver 5"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Driver 5</h2>
          <img
            alt="Team 5"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
      </div>
      <div className="border rounded-lg p-4 flex flex-row items-center text-center mb-8">
        <div className="flex flex-col items-center text-center mr-8">
          <img
            alt="Substitute Driver"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Substitute Driver</h2>
          <img
            alt="Team 6"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
        <div className="flex flex-col items-center text-center">
        <img
            alt="Substitute Driver"
            className="w-24 h-24 rounded-full mb-4"
            height="100"
            src="/placeholder.svg"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="100"
          />
          <h2 className="text-lg font-semibold mb-2">Constructor</h2>
          <img
            alt="Team 6"
            className="w-12 h-12 mb-4"
            height="50"
            src="/placeholder.svg"
            style={{
              aspectRatio: "50/50",
              objectFit: "cover",
            }}
            width="50"
          />
          <button>Select</button>
        </div>
      </div>
    </div>
    </>
  )
}
