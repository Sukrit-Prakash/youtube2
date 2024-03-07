class ApiResponse{
    constructor(statusCode,data,message="SUCCESS"){
        this.statusCode=statusCode
        this.data
        this.message = message
        this.success = statusCode <400
    }
}