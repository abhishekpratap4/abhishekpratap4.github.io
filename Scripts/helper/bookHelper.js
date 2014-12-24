var booksAPIHelper = {

    booksViewModel: {},

    /**
    * Key code for Enter key
    */
    ENTER_KEY_CODE: 13,

    /**
    * Code for identifying if book is not found
    */
    BOOK_NOT_FOUND: "0",

    /**
    * Represents a book
    */
    book: function () {
        this.author = ko.observable();
        this.title = ko.observable();
        this.downloadLink = ko.observable();
        this.desc = ko.observable();
        this.publisher = ko.observable();
        this.year = ko.observable();
        this.numberOfPages = ko.observable();
        this.isbn = ko.observable();
        this.id = ko.observable();
        this.subTitle = ko.observable();
        this.image = ko.observable();

        /**
        * This function is used to fetch book details
        */
        this.getBookInfo = function (data, event) {
            $.ajax({
                url: 'http://it-ebooks-api.info/v1/book/'.concat(data.ID),
                type: 'get'
            }).then(function (bookDetails) {
                if (!!bookDetails && bookDetails.Error === booksAPIHelper.BOOK_NOT_FOUND) {
                    booksAPIHelper.booksViewModel.showBookPanel(true);
                    booksAPIHelper.booksViewModel.myBook.author(bookDetails.Author);
                    booksAPIHelper.booksViewModel.myBook.title(bookDetails.Title);
                    booksAPIHelper.booksViewModel.myBook.downloadLink(bookDetails.Download);
                    booksAPIHelper.booksViewModel.myBook.desc(bookDetails.Description);
                    booksAPIHelper.booksViewModel.myBook.publisher(bookDetails.Publisher);
                    booksAPIHelper.booksViewModel.myBook.year(bookDetails.Year);
                    booksAPIHelper.booksViewModel.myBook.numberOfPages(bookDetails.Page);
                    booksAPIHelper.booksViewModel.myBook.isbn(bookDetails.ISBN);
                    booksAPIHelper.booksViewModel.myBook.subTitle(bookDetails.SubTitle);
                    booksAPIHelper.booksViewModel.myBook.image(bookDetails.Image);
                } else {
                    toastr.error("Book not found!");
                }
            });
        } 
    },

    /**
    * Represents a collection of books
    */
    bookList: function () {
        this.books = ko.observableArray();
        this.currentPage = ko.observable();
        this.totalResultPage = ko.observable();
        this.searchString = ko.observable();
        this.showBookPanel = ko.observable(false);
        this.myBook = new booksAPIHelper.book();

        /**
        * This function is used to fetch the set of matching records searched by user
        */
        this.getBooksList = function () {
            var that = this;
            if (that.searchString().trim().length > 0) {
                that.books.removeAll();
                $.ajax({
                    url: 'http://it-ebooks-api.info/v1/search/'.concat(that.searchString()),
                    type: 'get'
                }).then(function (booksListObject) {
                    if (!!booksListObject) {
                        that.currentPage(parseInt(booksListObject.Page));
                        var totalNoOfPages = parseInt(booksListObject.Total) / 10;
                        that.totalResultPage((parseInt(booksListObject.Total) % 10 === 0) ? parseInt(totalNoOfPages) : parseInt(totalNoOfPages) + 1);
                        if (!!booksListObject.Books && !!booksListObject.Books.length) {
                            $.each(booksListObject.Books, function (key, value) {
                                that.books.push(value);
                            });
                            toastr.success("Bingo! Matching records found.");
                        } else {
                            toastr.info("No match found! Try again!");
                        }
                    }
                });
            } else {
                toastr.error("Enter valid search string!");
            }
        };

        /**
        * This function is used to fetch previous 10 records
        */
        this.gotoPrevPage = function () {
            var that = this;
            $.ajax({
                url: 'http://it-ebooks-api.info/v1/search/'.concat(that.searchString()+'/page/'+ (that.currentPage() - 10)),
                type: 'get'
            }).then(function (booksListObject) {
                if (!!booksListObject) {
                    that.books.removeAll();
                    that.currentPage(parseInt(booksListObject.Page));                             
                    if (!!booksListObject.Books && !!booksListObject.Books.length) {
                        $.each(booksListObject.Books, function (key, value) {
                            that.books.push(value);
                        });
                        toastr.success("Previous 10 records found!");
                    } else {
                        toastr.info("No further matches found!");
                    }
                }
            });
        };

        /**
        * This function is used to fetch next 10 records 
        */
        this.gotoNextPage = function () {
            var that = this;
            $.ajax({
                url: 'http://it-ebooks-api.info/v1/search/'.concat(that.searchString() + '/page/' + (that.currentPage() + 10)),
                type: 'get'
            }).then(function (booksListObject) {
                if (!!booksListObject) {
                    that.books.removeAll();
                    that.currentPage(parseInt(booksListObject.Page));
                    if (!!booksListObject.Books && !!booksListObject.Books.length) {
                        $.each(booksListObject.Books, function (key, value) {
                            that.books.push(value);
                        });
                        toastr.success("Next 10 records found!");
                    } else {
                        toastr.info("No further matches found!");
                    }
                }
            });
        };
    },

    /**
    * Method for handling Enter key press event
    */
    handleKeyPress: function (data, event) {
        if (event.keyCode === booksAPIHelper.ENTER_KEY_CODE) {
            booksAPIHelper.booksViewModel.searchString($(event.currentTarget).val());
            booksAPIHelper.booksViewModel.getBooksList();
        }
    }    
}

/**
* Create a new booklist object and assign its reference to booksViewModel 
*/
booksAPIHelper.booksViewModel = new booksAPIHelper.bookList();

/**
* Apply Knockout bindings
*/
$(document).ready(function () {    
        ko.applyBindings(booksAPIHelper.booksViewModel);
        booksAPIHelper.booksViewModel.searchString('programming'); // to load default data on-load
        booksAPIHelper.booksViewModel.getBooksList();
    });