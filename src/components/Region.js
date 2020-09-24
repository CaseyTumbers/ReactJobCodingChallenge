import React, {Component} from 'react';
import './Region.css';

class Region extends Component{
    constructor(props) {
        super(props);
        this.myRef = React.createRef();

        this.state =
            {
                map: null, //Entire Network with all edges weightings.
                Mn: [], //Set of nodes that contain N (name string).
                Md: []  //Set of nodes that are within D (distance) or Mn nodes.
            }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {
        const region = this.myRef.current;
        const ctx = region.getContext("2d");

        //If data has changed, generate map based on data from uploaded .json file.
        if(this.props.data !== null && prevProps.data !== this.props.data){
            this.generateMap();
        }

        //If fields have changed begin process to generate minimum spanning tree based on user's inputs.
        if(((this.props.D !== null && prevProps.D !== this.props.D) || (this.props.N !== null && prevProps.N !== this.props.N)) && this.props.data !== null)
        {
            this.generateMST(ctx);
            this.setState({algFlag: true});
        }

        if(this.props.data !== undefined) {
            this.props.data.forEach((point, i) =>
            {
                if(this.state.Mn[i] === this.props.data[i].name)
                {
                    ctx.fillStyle = "green";
                }
                else if(this.state.Md[i] === this.props.data[i].name)
                {
                    ctx.fillStyle = "blue";
                }
                else
                {
                    ctx.fillStyle = "black";
                }

                ctx.font = "15px Arial";
                ctx.beginPath();
                ctx.arc(point.x*5, point.y*5, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.textAlign = "center";
                ctx.fillText(this.props.data[i].name, point.x*5, point.y*5-4);
            });
        }
    }

    //Generates and draws minimum spanning tree based in users inputs.
    generateMST(ctx)
    {
        this.state.Mn = new Array(this.props.data.length);
        this.state.Md = new Array(this.props.data.length);
        ctx.clearRect(0, 0, 500, 500);
        for(let i=0;i<this.props.data.length;i++)
        {
            this.state.Mn[i] = null;
            console.log(this.props.data[i].name.includes(this.props.N));
            if(this.props.data[i].name.includes(this.props.N))
            {
                this.state.Mn[i] = this.props.data[i].name;

                this.drijksAlg(this.state.map, i, ctx);
            }
        }
    }

    //Dijkstra's algorithm to find shortest path between source node and every other node.
    drijksAlg(graph, source, ctx)
    {
        //Stores the distances between source node and other nodes.
        let dist = new Array(graph.length);

        //Stores bool values of whether node has been included in shortest path, or shortest
        //distance between source and node has been calculated.
        let sptSet = new Array(graph.length);

        //Parent array to store shortest paths, used when node does not have direct connection with other node.
        let parent = new Array(graph.length);

        //Initialising Arrays
        for(let i=0;i<dist.length;i++)
        {
            dist[i] = Number.MAX_SAFE_INTEGER;
            sptSet[i] = false;
            parent[i] = null;
        }

        //Sources distance to self is 0.
        dist[source] = 0;

        parent[source] = -1;

        for(let i=0;i<graph.length-1;i++)
        {
            //Get minimum distance vertex from unprocessed vertices.
            let u = this.minimumDistance(dist,sptSet);

            sptSet[u] = true;

            //Update distance values.
            for(let v=0;v<graph.length;v++)
            {
                if (!sptSet[v] && graph[u][v] !== 0 && dist[u] !== Number.MAX_SAFE_INTEGER && (dist[u] + graph[u][v]) < dist[v]) {
                    dist[v] = dist[u] + graph[u][v];
                    parent[v] = u;
                }
            }
        }

        this.setState({parentPath: parent});
        this.draw(dist,source,parent,ctx);

    }

    //Draws the path between nodes.
    draw(dist,source, parent, ctx)
    {
        let scale = 5;
        ctx.beginPath();
        let d = this.props.D;

        if(d === null)
        {
            d = 0;
        }

        //Coordinate data to draw lines between.
        let xCoord, yCoord, xParentCoord, yParentCoord, xSourceCoord, ySourceCoord;
        for(let i=0;i<dist.length;i++)
        {
            xCoord = this.props.data[i].x*scale;
            yCoord = this.props.data[i].y*scale;
            xSourceCoord = this.props.data[source].x*scale;
            ySourceCoord = this.props.data[source].y*scale;
            if(dist[i]<d)
            {
                this.state.Md[i] = this.props.data[i].name;

                //If node does not have direct connection with source node, connect parents to make path.
                if(parent[i] !== source && parent[i] !== -1)
                {
                    xParentCoord = this.props.data[parent[i]].x*scale;
                    yParentCoord = this.props.data[parent[i]].y*scale;
                    ctx.moveTo(xParentCoord, yParentCoord);
                    ctx.lineTo(xCoord, yCoord);
                    ctx.stroke();
                }
                else {
                    ctx.moveTo(xSourceCoord, ySourceCoord);
                    ctx.lineTo(xCoord, yCoord);
                    ctx.stroke();
                }
            }
        }
    }

    //Gets minimum distance vertex from unprocessed vertices.
    minimumDistance(dist, sptSet)
    {
        let minWeight = Number.MAX_SAFE_INTEGER;
        let minKey = null;

        for(let i=0;i<dist.length;i++)
        {
            if(sptSet[i]===false && dist[i] < Number.MAX_SAFE_INTEGER)
            {
                if(dist[i] < minWeight)
                {
                    minWeight = dist[i];
                    minKey = i;
                }
            }
        }

        return minKey;
    }

    //Calculation of distance using distance formula.
    calculateDistance(index, otherIndex)
    {
        let distance;
        distance = Math.sqrt(Math.pow((this.props.data[otherIndex].x - this.props.data[index].x),2)+Math.pow((this.props.data[otherIndex].y - this.props.data[index].y),2));

        return distance;
    }

    //Gets index of connected node.
    getIndex(c)
    {
        let temp = null;
        this.props.data.forEach((point,index) =>
        {
            if(point.name === c){
                temp = index;
            }
        });

        return temp;
    }

    //Generates Network of nodes. Calculates all weights of edges so minimum spanning tree algorithm can be used.
    generateMap = () =>
    {
        let newMap = new Array(this.props.data.length);
        let otherIndex = null;
        for(let i=0;i<newMap.length;i++)
        {
            newMap[i] = new Array(this.props.data.length);
        }

        this.props.data.forEach((point, index) =>
        {
            point.connections.forEach((connection) =>
            {
                otherIndex = this.getIndex(connection);
                newMap[index][otherIndex] = this.calculateDistance(index, otherIndex);
                newMap[otherIndex][index] = this.calculateDistance(index, otherIndex);
            });
        });
        this.setState({map: newMap});
        this.setState({flag: true});
    };

    //Render canvas.
    render() {
        return (
            <div className="canvasSpace">
                <canvas id="region" ref={this.myRef} width="500" height="500"/>
            </div>
        );
    }
}

export default Region;